export class ConnectionConfig {
    name:string="";
    host: string = "";
    port: number = 0;
    userId: string = "";
    password: string = "";
    database?: string = "";
    dbType: DbType = DbType.mysql;
}
export enum DbType {
    mysql = 0,
    mssql = 1,
    plsql = 2,
    oracle = 3
}