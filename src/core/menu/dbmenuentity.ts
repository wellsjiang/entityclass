export class DbMenuEntity {
    Id: string = "";
    Name: string = "";
    Filed: string = "";
    Type: DbMenuType = DbMenuType.Root;
    Description: string = "";
    IsParent: boolean = false;
    icon: string = "";
    Child: Array<DbMenuEntity> = new Array<DbMenuEntity>();
    ParentName: string = "";
    constructor(id?: string, name?: string, type?: DbMenuType, description?: string, child?: Array<DbMenuEntity>, isParent?: boolean, image?: string) {
        if (id) {
            this.Id = id;
        }
        if (name) {
            this.Name = name;
        }
        if (type) {
            this.Type = type;
        }
        if (description) {
            this.Description = description;
        }
        if (child) {
            this.Child = child;
        }
        if (isParent != undefined) {
            this.IsParent = isParent;
        }
        if (image) {
            this.icon = image;
        }
    }
}
export enum DbMenuType {
    Root = 0,
    Database = 1,
    TableRoot = 2,
    ViewRoot = 3,
    Table = 4,
    View = 5
}