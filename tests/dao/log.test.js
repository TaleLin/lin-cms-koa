require("../helper/initial");
const { V } = require("../helper/v");
const { LogDao } = require("../../app/api/cms/log");
const { db } = require("lin-mizar/lin/db");

describe("book.test.js", () => {
  /**
   * @type LogDao
   */
  let logDao;

  beforeAll(async () => {
    logDao = new LogDao();
  });

  afterAll(() => {
    setTimeout(() => {
      db.close();
    }, 500);
  });

  test("获取日志", async () => {
    const v = new V({
      name: "super"
    });
    // const ctx = context({
    //   url: "",
    //   body: {}
    // });
    const { rows, total } = await logDao.getLogs(v, 0, 10);
    expect(rows).toHaveLength(1);
    expect(total).toBe(1);
  });

  test("搜索日志", async () => {
    const v = new V({
      name: "super"
    });
    const { rows, total } = await logDao.searchLogs(v, 0, 10, "super");
    expect(rows).toHaveLength(1);
    expect(total).toBe(1);
  });

  test("日志用户", async () => {
    const names = await logDao.getUserNames(0, 10);
    expect(names).toHaveLength(1);
  });
});
