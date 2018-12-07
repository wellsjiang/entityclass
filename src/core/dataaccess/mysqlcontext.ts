import * as mysql from 'mysql';
import * as crypto from 'crypto';
import { CommonMsg } from '../common/commonmsg';
import { ConnectionConfig, DbType } from '../common/connectionconfig';
export class MysqlContext {
    private readonly PoolOptionHash: string;
    private static ConnectionDictionary: { [key: string]: mysql.Pool; } = {};
    constructor(config: ConnectionConfig) {
        var poolOption = {
            host: config.host,
            port: config.port,
            user: config.userId,
            password: config.password,
            database: config.database,
            timeout: 60 * 2 * 1000
        };
        this.PoolOptionHash = this.GetHashCode(poolOption);
        if (config.database) {
            poolOption.database = config.database;
        }
        if (!MysqlContext.ConnectionDictionary[this.PoolOptionHash]) {
            let connectionPool = mysql.createPool(poolOption);
            MysqlContext.ConnectionDictionary[this.PoolOptionHash] = connectionPool;
        }
    }
    private GetHashCode(data: any): string {
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
        let pool: mysql.Pool = MysqlContext.ConnectionDictionary[this.PoolOptionHash];
        return new Promise<CommonMsg>((executer) => {
            pool.getConnection((error, connection) => {
                if (error) {
                    executer(new CommonMsg(false, error.message, null, error));
                } else {
                    connection.query(sql, value || [], (queryError, data) => {
                        if (queryError) {
                            executer(new CommonMsg(false, queryError.message, null, queryError));
                        } else {
                            executer(new CommonMsg(true, "", data, null));
                        }
                    })
                    connection.release()
                }
            })
        })
    }
}