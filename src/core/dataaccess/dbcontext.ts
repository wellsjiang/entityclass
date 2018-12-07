import { MysqlContext } from './mysqlcontext';
import { MssqlContext } from './mssqlcontext';
import { CommonMsg } from '../common/commonmsg';
import { ConnectionConfig, DbType } from '../common/connectionconfig';
export class DbContext {
    private config: ConnectionConfig;
    constructor(config: ConnectionConfig) {
        this.config = config;
    }
    async query(sql: string, value?: Array<any>): Promise<CommonMsg> {
        switch (this.config.dbType) {
            case DbType.mysql:
                return new MysqlContext(this.config).query(sql, value || []);
            case DbType.mssql:
                return new MssqlContext(this.config).query(sql, value || []);
            default:
                return new MysqlContext(this.config).query(sql, value || []);
        }
    }
}