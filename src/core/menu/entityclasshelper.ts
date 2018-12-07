
import { ConnectionConfig, DbType } from '../common/connectionconfig';
import { ClassEntity } from './classentity';
export class EntityClassHelper {

    private mssqlNetTypeMap: { [key: string]: string; } = {
        "image": "byte[]",
        "text": "string",
        "uniqueidentifier": "Guid",
        "date": "DateTime",
        "time": "DateTime",
        "datetime2": "DateTime",
        "datetimeoffset": "DateTime",
        "tinyint": "byte",
        "smallint": "short",
        "int": "int",
        "smalldatetime": "DateTime",
        "real": "string",
        "money": "decimal",
        "datetime": "DateTime",
        "float": "double",
        "sql_variant": "object",
        "ntext": "string",
        "bit": "bool",
        "decimal": "decimal",
        "numeric": "decimal",
        "smallmoney": "decimal",
        "bigint": "long",
        "hierarchyid": "byte[]",
        "geometry": "byte[]",
        "geography": "byte[]",
        "varbinary": "byte[]",
        "varchar": "string",
        "binary": "byte[]",
        "char": "string",
        "timestamp": "DateTime",
        "nvarchar": "string",
        "nchar": "string",
        "xml": "string",
        "sysname": "string"
    }

    private mysqlNetTypeMap: { [key: string]: string; } = {
        "bigint": "long",
        "binary": "byte[]",
        "bit": "bool",
        "tinyblob": "byte[]",
        "tinyint": "byte",
        "int": "int",
        "datetime": "DateTime",
        "date": "DateTime",
        "decimal": "decimal",
        "double": "double",
        "enum": "string",
        "float": "double",
        "geomcollection": "byte[]",
        "geometry": "byte[]",
        "json": "string",
        "linestring": "byte[]",
        "longblob": "byte[]",
        "longtext": "byte[]",
        "mediumblob": "byte[]",
        "mediumint": "byte[]",
        "mediumtext": "byte[]",
        "multilinestring": "byte[]",
        "multipoint": "byte[]",
        "multipolygon": "byte[]",
        "char": "string",
        "varchar": "string",
        "point": "byte[]",
        "polygon": "byte[]",
        "set": "string",
        "smallint": "short",
        "text": "string",
        "timestamp": "DateTime",
        "time": "DateTime",
        "varbinary": "byte[]",
        "year": "DateTime"
    }

    public ConvertToClass(dbType: DbType, data: Array<ClassEntity>) {
        return this.GetNetClass(dbType, data);
    }

    private GetNetClass(dbType: DbType, data: Array<ClassEntity>) {
        let content = "";
        data.forEach(x => {
            let fieldContent = "";
            let type = this.GetNetFieldType(dbType, x.Type);
            type = `${type}${x.IsNullable && type != "string" ? "?" : ""}`;
            let description = x.Description == undefined || x.Description == null || x.Description == "" ? x.Field : x.Description.replace(/\n/g, "\n\t\t/// ");
            fieldContent += `\n\t\t/// <summary>\n\t\t/// ${description}\n\t\t/// </summary>\n`;
            if (x.IsPrimaryKey) {
                fieldContent += '\t\t[Key]\n';
            }
            fieldContent += `\t\t[Column("${x.Column}")]\n`;
            fieldContent += `\t\tpublic ${type} ${x.Field} { get; set; }\n`;
            content += fieldContent;
        });
        return `using System;\nusing System.ComponentModel.DataAnnotations;\nusing System.ComponentModel.DataAnnotations.Schema;\nnamespace AutoEntityClass.Model\n{\n\t[Table("${data[0].Name}")]\n\tpublic class ${data[0].Name}\n\t{${content}\t}\n}`
    }

    private GetNetFieldType(dbType: DbType, type: string) {
        var netType = "";
        switch (dbType) {
            case DbType.mysql:
                netType = this.mysqlNetTypeMap[type];
                break;
            case DbType.mssql:
                netType = this.mssqlNetTypeMap[type];
                break;
            default:
                netType = this.mysqlNetTypeMap[type];
                break;
        }
        if (netType == undefined || netType == "") netType = "string";
        return netType;
    }
}