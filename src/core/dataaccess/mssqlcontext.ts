import * as crypto from 'crypto';
import mssql from 'mssql';
import { CommonMsg } from '../common/commonmsg';
import { ConnectionConfig, DbType } from '../common/connectionconfig';
export class MssqlContext {
    private readonly PoolOptionHash: string;
    private static ConnectionDictionary: { [key: string]: mssql.ConnectionPool; } = {};
    constructor(config: ConnectionConfig) {
        var poolOption = {
            server: config.host,
            port: config.port,
            user: config.userId,
            password: config.password,
            database: '',
            pool: {
                idleTimeoutMillis: 30 * 1000
            }
        };
        this.PoolOptionHash = this.getHashCode(poolOption);
        if (config.database) {
            poolOption.database = config.database;
        }
        if (!MssqlContext.ConnectionDictionary[this.PoolOptionHash]) {
            let pool = new mssql.ConnectionPool(poolOption as mssql.config);
            MssqlContext.ConnectionDictionary[this.PoolOptionHash] = pool;
        }
    }
    private getHashCode(data: any): string {
        let temp = "";
        if (data === undefined) temp = "undefined";
        if (data === null) temp = "null";
        if (temp == "") {
            temp = JSON.stringify(data);
        }
        var hash = crypto.createHash("sha1");
        hash.update(temp);
        var hashcode = hash.digest("hex");  //加密后的值d
        return hashcode;
    }
    async query(sql: string, value?: Array<any>): Promise<CommonMsg> {
        let pool: mssql.ConnectionPool = MssqlContext.ConnectionDictionary[this.PoolOptionHash];
        return new Promise<CommonMsg>((executor) => {
            var parameterCount = sql.split('?').length - 1;
            if (parameterCount != 0 && (value != undefined) && parameterCount != value.length) {
                let error = new Error("参数数量错误，请检查是否遗漏或者多出个别参数");
                executor(new CommonMsg(false, error.message, null, error));
            } else {
                pool.connect().then(myPool => {
                    let request = myPool.request();
                    var parameter = this.getParameter(sql, value || []);
                    parameter.parameter.map(param => {
                        request.input(param.name, param.value);
                    });
                    return request.query(parameter.sql);
                }).then(result => {
                    pool.close();
                    executor(new CommonMsg(true, "", result.recordset, null));
                }).catch((error: Error) => {
                    pool.close();
                    executor(new CommonMsg(false, error.message, null, error));
                });
            }
        });
    }

    private getParameter(sql: string, value: Array<any>): { sql: string, parameter: Array<{ name: string, value: any }> } {
        let newSql: string = "";
        let mark: number = 0;
        var result = { sql: sql, parameter: new Array<{ name: string, value: any }>() };
        if (sql.split('?').length == 1) {
            return result;
        }
        for (let index = 0; index < sql.length; index++) {
            if (sql.charAt(index) == "?") {
                var parameValue = value[mark];
                if (parameValue instanceof Array) {
                    let nameArray: Array<string> = [];
                    parameValue.map((x, index) => {
                        let thisName = 'InParam' + mark + index;
                        nameArray.push("@" + thisName);
                        result.parameter.push({ name: thisName, value: x });
                    });
                    newSql += nameArray.join(",");
                } else {
                    let parameName = "parame" + mark;
                    result.parameter.push({ name: parameName, value: parameValue });
                    newSql += ("@" + parameName);
                }
                mark++;
            } else {
                newSql += sql.charAt(index);
            }
        }
        result.sql = newSql;
        return result;
    }
}