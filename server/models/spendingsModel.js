import db from "../server.js";
import ErrorApi from "../utils/ErrorApi.js";
import {
  buildSelectQuery,
  formatCreatedAtForUser,
  sanitizeSpendingInput,
} from "../utils/helperFunctions.js";

async function getSpendings(userId, queryObj, userTimezone) {
  const filterRules = {
    spending_category: {
      column: "spending_category",
      op: "=",
    },
    payment_method: { column: "payment_method", op: "=" },
    amount_gte: {
      column: "amount",
      op: ">=",
    },
    amount_lte: {
      column: "amount",
      op: "<=",
    },
    start_date: {
      column: "created_at",
      op: ">=",
    },
    end_date: {
      column: "created_at",
      op: "<=",
    },
  };

  const { recordQuery, metaDataQuery, valuesForMetaData, valuesForRecords } =
    buildSelectQuery({
      table: "spendings",
      userId,
      queryObj,
      filterRules,
      userTimezone,
    });

  const [[rows], [results]] = await Promise.all([
    db.execute(recordQuery, valuesForRecords),
    db.execute(metaDataQuery, valuesForMetaData),
  ]);

  rows.forEach((el) => {
    const formattedTime = formatCreatedAtForUser(el.created_at, userTimezone);
    el.created_at = formattedTime;
  });

  const { limit, page } = queryObj;
  const totalCount = Number(results[0]?.total ?? 0);
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    data: rows,
    pagination: {
      totalCount,
      pageSize: limit,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

async function uploadSpending(spendingObj, userId) {
  const { spendingName, spendingCategory, amount, paymentMethod } = spendingObj;

  const insertSpendingQuery =
    "insert into spendings (user_id, spending_name, spending_category, amount, payment_method) values (?, ?, ?, ?, ?)";

  const category = spendingCategory ?? "Generic";
  const method = paymentMethod ?? "cash";

  const insertSpendingValues = [userId, spendingName, category, amount, method];

  const updateBalanceQuery =
    "update users set balance = balance + ? where id = ?";
  const updateBalanceValues = [amount, userId];

  const getUserBalanceQuery = "select balance from users where id = ?";

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [spendingResult] = await connection.execute(
      insertSpendingQuery,
      insertSpendingValues,
    );
    await connection.execute(updateBalanceQuery, updateBalanceValues);
    const [userRows] = await connection.execute(getUserBalanceQuery, [userId]);
    await connection.commit();
    return {
      spending: {
        id: spendingResult.insertId,
        spendingName,
        spendingCategory: category,
        amount,
        paymentMethod: method,
      },
      userBalance: userRows[0]?.balance,
    };
  } catch (error) {
    await connection.rollback();
    if (error instanceof ErrorApi) throw error;
    throw new ErrorApi("Failed to create spending record", 500);
  } finally {
    connection.release();
  }
}

async function deleteSpending(spendingId, userId) {
  const getSpendingAmountQuery =
    "select amount from spendings where id = ? and user_id = ?";
  const updateBalanceQuery =
    "update users set balance = balance - ? where id = ?";
  const deleteSpendingQuery =
    "delete from spendings where id = ? and user_id = ?";
  const getUserBalanceQuery = "select balance from users where id = ?";

  const deleteSpendingValues = [spendingId, userId];
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const [spendingRows] = await connection.execute(getSpendingAmountQuery, [
      spendingId,
      userId,
    ]);

    if (!spendingRows.length) {
      throw new ErrorApi("No spending was found with the provided ID", 400);
    }

    const spendingAmount = spendingRows[0].amount;
    const updateBalanceValues = [spendingAmount, userId];

    await connection.execute(updateBalanceQuery, updateBalanceValues);
    await connection.execute(deleteSpendingQuery, deleteSpendingValues);
    const [userRows] = await connection.execute(getUserBalanceQuery, [userId]);
    await connection.commit();
    return {
      spendingId,
      userBalance: userRows[0]?.balance,
    };
  } catch (error) {
    await connection.rollback();
    if (error instanceof ErrorApi) throw error;
    throw new ErrorApi("Failed to delete spending record", 500);
  } finally {
    connection.release();
  }
}

async function updateSpending(spendingObj, spendingId, userId) {
  const { updateSpendingQuery, values } = sanitizeSpendingInput(
    spendingObj,
    spendingId,
    userId,
  );
  const AmountFlag = spendingObj.amount && spendingObj.currentAmount;
  const updateBalanceQuery =
    "update users set balance = balance - ? where id = ? ";
  const getUserBalanceQuery = "select balance from users where id = ?";

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [spendingUpdateResult] = await connection.execute(
      updateSpendingQuery,
      values,
    );

    if (spendingUpdateResult.affectedRows === 0) {
      throw new ErrorApi("No spending was found with the provided ID", 400);
    }

    if (AmountFlag) {
      const amountDifference = spendingObj.currentAmount - spendingObj.amount;
      await connection.execute(updateBalanceQuery, [amountDifference, userId]);
    }

    const [userRows] = await connection.execute(getUserBalanceQuery, [userId]);
    await connection.commit();

    const { currentAmount, ...cleanSpendingObj } = spendingObj;

    return {
      spending: {
        id: spendingId,
        ...cleanSpendingObj,
      },
      userBalance: userRows[0]?.balance,
    };
  } catch (err) {
    await connection.rollback();
    if (err instanceof ErrorApi) throw err;

    throw new ErrorApi("Failed to update spending record", 500);
  } finally {
    connection.release();
  }
}

export { getSpendings, uploadSpending, deleteSpending, updateSpending };
