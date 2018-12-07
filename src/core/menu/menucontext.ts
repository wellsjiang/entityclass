import * as fs from 'fs';
import { join } from 'path';
import { CommonMsg } from '../common/commonmsg';
import { ConnectionConfig, DbType } from '../common/connectionconfig';
import { DbMenuEntity, DbMenuType } from './dbmenuentity';
import { ClassEntity } from './classentity';
import { DbContext } from '../dataaccess/dbcontext';
import GUID from 'uuid';
export class MenuContext {
    private rootPath: string = join(__dirname, '../../../');

    private static TableViewDbDictionary: { [key: string]: ConnectionConfig; } = {};

    public async GetEntityClass(option: DbMenuEntity): Promise<Array<ClassEntity>> {
        return new Promise<Array<ClassEntity>>(async (excutor) => {
            var selectSql = "";
            var dbConfig = MenuContext.TableViewDbDictionary[option.Id];
            if (option.Type == DbMenuType.Table) {
                selectSql = this.GetTableEntitySql(dbConfig.dbType, option.ParentName, option.Name)
            } else {
                selectSql = this.GetViewEntitySql(dbConfig.dbType, option.ParentName, option.Name);
            }
            var result = await new DbContext(dbConfig).query(selectSql);
            let data: Array<ClassEntity> = null ? new Array<ClassEntity>() : result.Data;
            if (dbConfig.dbType == DbType.mssql) {
                data.forEach(x => {
                    if (x.DefaultValue != null && x.DefaultValue != "" && x.DefaultValue.length > 0) {
                        while (x.DefaultValue.substr(0, 1) == "(" && x.DefaultValue.substr(x.DefaultValue.length - 1) == ")") {
                            x.DefaultValue = x.DefaultValue.substr(1);
                            x.DefaultValue = x.DefaultValue.substr(0, x.DefaultValue.length - 1);
                        }
                    }
                });
            }
            excutor(data);
        });
    }

    public async GetDbTreeArray(): Promise<Array<DbMenuEntity>> {
        return new Promise<Array<DbMenuEntity>>(async (excutor) => {
            MenuContext.TableViewDbDictionary = {};
            let response = new Array<DbMenuEntity>();
            let dbConfig = await this.GetDbConfig();
            for (let mark = 0; mark < dbConfig.length; mark++) {
                let config = dbConfig[mark];
                let selectDbSql = this.GetDatabaseSql(config.dbType);
                try {
                    let result = await new DbContext(config).query(selectDbSql);
                    if (result.IsSuccess) {
                        let data: Array<DbMenuEntity> = result.Data;
                        var root = new DbMenuEntity(config.name, config.name, DbMenuType.Root, "", [], data.length > 0, this.RootImg);
                        for (let index = 0; index < data.length; index++) {
                            let database = data[index];
                            let db = new DbMenuEntity(database.Id, database.Name, DbMenuType.Database, "", [], true, this.DbImg);
                            let tables = await this.GetTables(config, database.Name);
                            let views = await this.GetViews(config, database.Name);
                            tables.forEach(x => {
                                if (!MenuContext.TableViewDbDictionary[x.Id]) {
                                    MenuContext.TableViewDbDictionary[x.Id] = config;
                                }
                            });
                            views.forEach(x => {
                                if (!MenuContext.TableViewDbDictionary[x.Id]) {
                                    MenuContext.TableViewDbDictionary[x.Id] = config;
                                }
                            });
                            db.Child.push(new DbMenuEntity(GUID.v4(), "表格", DbMenuType.TableRoot, "表格", tables, tables.length > 0, this.FileImg));
                            db.Child.push(new DbMenuEntity(GUID.v4() + "ViewRoot_" + index, "视图", DbMenuType.TableRoot, "视图", views, tables.length > 0, this.FileImg));
                            root.Child.push(db);
                        }
                        response.push(root);
                    }
                } catch (exception) {
                    console.log(exception);
                }
            }
            excutor(response);
        });
    }

    private async GetTables(config: ConnectionConfig, dbName: string): Promise<Array<DbMenuEntity>> {
        let response = new Array<DbMenuEntity>();
        let selectSql = this.GetTableSql(config.dbType, dbName);
        let result = await new DbContext(config).query(selectSql);
        if (result.IsSuccess) {
            let data: Array<DbMenuEntity> = result.Data;
            data.forEach((table: DbMenuEntity) => {
                let entity = new DbMenuEntity(table.Id, table.Name, DbMenuType.Table, table.Description, [], false, this.TableImg);
                entity.ParentName = dbName;
                response.push(entity);
            });
        }
        return response;
    }

    private async GetViews(config: ConnectionConfig, dbName: string): Promise<Array<DbMenuEntity>> {
        let response = new Array<DbMenuEntity>();
        let selectSql = this.GetViewSql(config.dbType, dbName);
        let result = await new DbContext(config).query(selectSql);
        if (result.IsSuccess) {
            let data: Array<DbMenuEntity> = result.Data;
            data.forEach((view: DbMenuEntity) => {
                let entity = new DbMenuEntity(view.Id, view.Name, DbMenuType.View, view.Description, [], false, this.ViewImg);
                entity.ParentName = dbName;
                response.push(entity);
            });
        }
        return response;
    }

    private GetDatabaseSql(dbType: DbType): string {
        let selectDbSql = "";
        switch (dbType) {
            case DbType.mysql:
            default:
                selectDbSql = "SELECT uuid() as `Id`,`SCHEMA_NAME` as `Name`,'' AS `Description` FROM information_schema.SCHEMATA WHERE `SCHEMA_NAME` NOT IN('mysql','information_schema','performance_schema','sys')";
                break;
            case DbType.mssql:
                selectDbSql = "SELECT NEWID() as [Id],[name] as [Name],'' AS [Description] FROM sys.databases WHERE HAS_DBACCESS(name) = 1 AND [name] NOT IN('master','tempdb','model','msdb') AND [name] NOT LIKE '%$%'";
                break;
        }
        return selectDbSql;
    }

    private GetTableSql(dbType: DbType, dbName: string): string {
        let selectDbSql = "";
        switch (dbType) {
            case DbType.mysql:
            default:
                selectDbSql = "SELECT uuid() as `Id`,`TABLE_NAME` as `Name`,`TABLE_COMMENT` AS `Description` from information_schema.TABLES where `TABLE_TYPE` ='BASE TABLE' and `TABLE_SCHEMA` NOT IN('mysql','information_schema','performance_schema','sys') AND `TABLE_SCHEMA` = '" + dbName + "'";
                break;
            case DbType.mssql:
                selectDbSql = `SELECT NEWID() AS [Id],[Objs].[name] AS [Name],ISNULL([Ext].[value],'') AS [Description]  
                FROM (select [object_id],[name] from `+ dbName + `.sys.all_objects where [type] ='U' and [is_ms_shipped] = 0 )
                Objs Left join sys.extended_properties Ext
                ON [Objs].[object_id] = [Ext].[major_id] AND [Ext].[minor_id] = 0`;
                break;
        }
        return selectDbSql;
    }

    private GetViewSql(dbType: DbType, dbName: string): string {
        let selectDbSql = "";
        switch (dbType) {
            case DbType.mysql:
            default:
                selectDbSql = "SELECT uuid() as `Id`,`TABLE_NAME` as `Name`,'' AS `Description`  FROM information_schema.VIEWS WHERE `TABLE_SCHEMA` NOT IN('mysql','information_schema','performance_schema','sys') AND  `TABLE_SCHEMA` = '" + dbName + "'";
                break;
            case DbType.mssql:
                selectDbSql = "select NEWID() as [Id],[name] as [Name],'' AS [Description]  from " + dbName + ".sys.all_views where [type] ='V' and [is_ms_shipped] = 0";
                break;
        }
        return selectDbSql;
    }

    private async GetDbConfig(): Promise<Array<ConnectionConfig>> {
        var result = new Array<ConnectionConfig>();
        var jsonResult = await this.readConfigFile();
        if (jsonResult.IsSuccess) {
            result = JSON.parse(jsonResult.Data);
        }
        return result;

    }

    private GetTableEntitySql(dbType: DbType, dbName: string, name: string) {
        let selectDbSql = "";
        switch (dbType) {
            case DbType.mysql:
            default:
                selectDbSql = "SELECT `TABLE_NAME` as `Name`, `COLUMN_NAME` as `Column`,`COLUMN_NAME` as `Field`, `DATA_TYPE` AS `Type`, `COLUMN_DEFAULT` AS `DefaultValue`, IFNULL(`CHARACTER_MAXIMUM_LENGTH`,0) AS 'StringLength', IFNULL(`NUMERIC_SCALE`,0) AS `NumericLength`, CASE `IS_NULLABLE` WHEN 'NO' THEN 0 ELSE 1 END AS `IsNullable`, `COLUMN_COMMENT` AS `Description`, (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE AS kcu WHERE kcu.`CONSTRAINT_NAME` ='PRIMARY' AND kcu.`TABLE_SCHEMA` = col.`TABLE_SCHEMA` AND kcu.`TABLE_NAME` = col.`TABLE_NAME` AND kcu.`COLUMN_NAME` = col.`COLUMN_NAME`) AS `IsPrimaryKey` from  information_schema.columns as col where TABLE_SCHEMA = '" + dbName + "' AND TABLE_NAME = '" + name + "' order by `TABLE_SCHEMA`,`TABLE_NAME`,`ORDINAL_POSITION`";
                break;
            case DbType.mssql:
                selectDbSql = `USE ` + dbName + `;
                SELECT 
                baseInfo.name AS [Name],
                CluInfo.name AS [Column],
                CluInfo.name AS [Field],
                Ts.name as [Type],
                ISNULL(com.[text],'') AS [DefaultValue],
                COLUMNPROPERTY(CluInfo.id,CluInfo.name,'PRECISION') AS [CharLength],
                ISNULL(COLUMNPROPERTY(CluInfo.id,CluInfo.name,'Scale'),0) AS [NumericLength],
                (CASE WHEN CluInfo.isnullable=1 THEN 1 ELSE 0 END) [IsNullable], 
                prop.value AS [Description],
                (SELECT COUNT(0) FROM syscolumns WHERE syscolumns.id=Object_Id('`+ name + `') and syscolumns.colid IN
                (SELECT keyno from sysindexkeys WHERE sysindexkeys.id=Object_Id('`+ name + `')) AND syscolumns.name = CluInfo.name) AS [IsPrimaryKey]
                FROM(SELECT * FROM sysobjects WHERE name = '`+ name + `') baseInfo 
                LEFT JOIN syscolumns CluInfo 
                ON CluInfo.id = baseInfo.id  
                LEFT JOIN systypes Ts 
                ON CluInfo.xtype=Ts.xusertype 
                LEFT JOIN sys.extended_properties prop
                ON CluInfo.id=prop.major_id AND CluInfo.colid = prop.minor_id 
                LEFT JOIN syscomments com 
                ON CluInfo.cdefault = COM.id
                ORDER BY CluInfo.colorder;`;
                break;
        }
        return selectDbSql;
    }

    private GetViewEntitySql(dbType: DbType, dbName: string, name: string) {
        let selectDbSql = "";
        switch (dbType) {
            case DbType.mysql:
            default:
                selectDbSql = "SELECT `TABLE_NAME` as `Name`, `COLUMN_NAME` as `Column`, `COLUMN_NAME` as `Field`, `DATA_TYPE` AS `Type`, `COLUMN_DEFAULT` AS `DefaultValue`, IFNULL(`CHARACTER_MAXIMUM_LENGTH`,0) AS 'StringLength', IFNULL(`NUMERIC_SCALE`,0) AS `NumericLength`, CASE `IS_NULLABLE` WHEN 'NO' THEN 0 ELSE 1 END AS `IsNullable`, `COLUMN_COMMENT` AS `Description`, 0 AS `IsPrimaryKey` from  information_schema.columns where TABLE_SCHEMA = '" + dbName + "' AND TABLE_NAME = '" + name + "' order by `TABLE_SCHEMA`,`TABLE_NAME`,`ORDINAL_POSITION`";
                break;
            case DbType.mssql:
                selectDbSql = `USE ` + dbName + `
                select 
                binfo.[name] AS [Name],
                CluInfo.[name] AS [Column],
                CluInfo.name AS [Field],
                types.[name] as [Type],
                viewdata.defaultvalue AS [DefaultValue],
                COLUMNPROPERTY(CluInfo.id,CluInfo.name,'PRECISION') AS [CharLength],
                ISNULL(COLUMNPROPERTY(CluInfo.id,CluInfo.name,'Scale'),0) AS [NumericLength],
                (CASE WHEN CluInfo.isnullable=1 THEN 1 ELSE 0 END) [IsNullable],
                viewdata.description as  [Description],
                0 AS IsPrimaryKey
                from (
                SELECT * FROM sys.sysobjects where name = '`+ name + `'
                ) binfo 
                left join syscolumns  CluInfo 
                ON CluInfo.id = binfo.id 
                inner join systypes types on 
                CluInfo.xtype= types.xusertype 
                left join(
                    SELECT viewcol.name,viewcol.xtype,com.[text] as [defaultvalue],prop.value as [description]  FROM(
                    select * from [INFORMATION_SCHEMA].[VIEW_COLUMN_USAGE] 
                    where [VIEW_CATALOG] =  '`+ dbName + `' AND [VIEW_NAME] = '` + name + `' 
                    ) viewinfo 
                    left join sys.sysobjects viewobj
                    on viewobj.[name] = viewinfo.[TABLE_NAME] 
                    left join syscolumns viewcol 
                    on viewobj.id = viewcol.id and viewcol.name = viewinfo.COLUMN_NAME
                    LEFT JOIN syscomments com 
                    ON viewcol.cdefault = com.id 
                    LEFT JOIN sys.extended_properties prop
                    ON viewcol.id=prop.major_id AND viewcol.colid = prop.minor_id 
                ) viewdata 
                on CluInfo.[name] = viewdata.[name] and CluInfo.xtype = viewdata.xtype
                order by CluInfo.colorder ;`;
                break;
        }
        return selectDbSql;
    }

    private async readConfigFile(): Promise<CommonMsg> {
        return new Promise<CommonMsg>((resolve, reject) => {
            fs.readFile(join(this.rootPath, "db.json"), "utf8", (error, data) => {
                if (error) {
                    resolve(new CommonMsg(false, error.message, null, error));
                } else {
                    resolve(new CommonMsg(true, "", data, null));
                }
            })
        })
    }

    private RootImg: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABFklEQVQ4T62TsU7DQBBEZwyBkwAlSIcEVJTUVPwGnxNXqZxv4V8oKWhpEAgjIhFFZ0EYdOcY7LNjkMIVV9zuPO3M2sSGhxvq8QOYvI5MsbxGwgsB211gAh+Abt1g6wqTw5nv+QaY9GUhiCBd71SSIbB0md1vAHbTfJaQQ2klX6HrHkPNP0j3LrNnLQDBYZDXVC1AaOgAmDSfA9zrH7+q6tFN7UmUQT4H/wx4cpk9/t2CANY8hHjKqyeDShCJg0zwewK7QjTj/EZgY/+kzksh7+rZEHJuai+jvNvx+dX61yKzo3Xh0oxDeM9Rw6mgT4KD0rbeCSYAHhp90pEHLJSwaIwoHIhlXNWhQBFvkZWdf/yZer+g9cUvPB1w1jtAGKUAAAAASUVORK5CYII=";
    private FileImg: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAi0lEQVQ4T2NkoBAwwvRz1Lx3YPjL8B/G/8HOcJGhQfADIfPBBnBWv73AwMCgj674z38mw99tgiA5nABmANxmFJX/GS78/89UgFX3f4aHPzoEH+A3AL/7P3xvFRaEhwEhv+KSp8QFDN9bhRlHDRg8YVD1dsJ/hv8GpKQFRgbGC9/bhAuok5BIsRldLQDuGkERvL/MdQAAAABJRU5ErkJggg==";
    private DbImg: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABUUlEQVQ4T62TTVLCQBSEuwerjCuTinvjCeAGcgNzA+EGLClxwQJS7vQGxBvEG+ANwg3iXipxxfjDPCtTEETRShW+9Ztvunt6iD2He57HFsDp54Eoc0FKSLAFwF1dUAgkFWFCox70jZetL64AztVzh+SkjiIR6eroJC53K8DRYC51Dq8VLca+twVwBvOYwGUdiAD3eux3tgH9PIBatkn2ADR/Ac1E5A6mMV3nsMlgMM9A1dEjb4ph7jofKEOsRh8gxdArnOu8DWMmOvLPvlvICJyKICORiKAwVGm5pMS0SLgiCEkEAjzpsR/sshCTPP8rBxF5XKLRe488C/9qIS6DsV1omJAClxRrQ4SpEAWXKtEOCufN3OrI7/54xkq+UYk+xKz0bNWUmbyiSWVCawPwFpFvS/Z/RSppG/mrKhPHVoHgxVaZTKyNXVWuU6BdO3v/xk9Gq6IRAP9dAwAAAABJRU5ErkJggg==";
    private TableImg: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAASklEQVQ4T2NkoBAwUqifgXoGcFa//Q9zzfdWYUZkPjZXgtSAxOEuoNgAcsOCoAuQvYPOJsoLRBsw6gUGBlzpgOhApNgAimOBXAMAlvZwEdEYecQAAAAASUVORK5CYII=";
    private ViewImg: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABVElEQVQ4T7WTQVLCQBBFf3cqEFaGgr3cQI/ADcATEG+AO5UFYWF0J57AHEFugDcIJ1D3psAVAWqmrUkMBgotLYrZzXT3mz//1xD2XLTnPA4E8Keus1ItCDWMQk0cLW08w6/OthVvKHAupw2w7hPB2/U0EYTQPEjuqq95fQ0o9+IuA30ALgQfmuCT4qe0kbVHlNbMmmmBvwhqD2aTApxeHBLQyakauFjc1Ialq/c2M44S2xqVV9pj4D7vMWqSoHZO28OmYW5z1VmqNhE9mr3ScsZiRWTpl+LTDIQqvTgCcFIs/BUAYELwp25lpcdFiAgGSYmHpYVqMsFNgnroXMd+wQdz32RuczMzMYWoEKDW2gdBlzSPvkzsEMH/VimjuW15JtaNGDPTaEjA8c4YgTetpbu8rWfp5ClsNxuQRdQUyGnWRJESGRcHfwXsuv2nswP9hX9I+ASGhIff7GKwGwAAAABJRU5ErkJggg==";


}