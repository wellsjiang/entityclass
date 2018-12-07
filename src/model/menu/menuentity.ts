import { MenuType } from '../enum/enumcollection';
export class DbRootMenuEntity {
    private _icon: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABFklEQVQ4T62TsU7DQBBEZwyBkwAlSIcEVJTUVPwGnxNXqZxv4V8oKWhpEAgjIhFFZ0EYdOcY7LNjkMIVV9zuPO3M2sSGhxvq8QOYvI5MsbxGwgsB211gAh+Abt1g6wqTw5nv+QaY9GUhiCBd71SSIbB0md1vAHbTfJaQQ2klX6HrHkPNP0j3LrNnLQDBYZDXVC1AaOgAmDSfA9zrH7+q6tFN7UmUQT4H/wx4cpk9/t2CANY8hHjKqyeDShCJg0zwewK7QjTj/EZgY/+kzksh7+rZEHJuai+jvNvx+dX61yKzo3Xh0oxDeM9Rw6mgT4KD0rbeCSYAHhp90pEHLJSwaIwoHIhlXNWhQBFvkZWdf/yZer+g9cUvPB1w1jtAGKUAAAAASUVORK5CYII=";
    Id: string = "";
    Name: string = "";
    IsParent: boolean = true;
    icon: string = this._icon;
    Child: Array<DatabaseMenuEntity> = [];
    Type: MenuType = MenuType.Root;
    constructor(id?: string, name?: string, child?: Array<DatabaseMenuEntity>) {
        if (id) {
            this.Id = id;
        }
        if (name) {
            this.Name = name;
        }
        if (child) {
            this.Child = child;
        }
    }
}
export class DatabaseMenuEntity {
    private _icon: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABUUlEQVQ4T62TTVLCQBSEuwerjCuTinvjCeAGcgNzA+EGLClxwQJS7vQGxBvEG+ANwg3iXipxxfjDPCtTEETRShW+9Ztvunt6iD2He57HFsDp54Eoc0FKSLAFwF1dUAgkFWFCox70jZetL64AztVzh+SkjiIR6eroJC53K8DRYC51Dq8VLca+twVwBvOYwGUdiAD3eux3tgH9PIBatkn2ADR/Ac1E5A6mMV3nsMlgMM9A1dEjb4ph7jofKEOsRh8gxdArnOu8DWMmOvLPvlvICJyKICORiKAwVGm5pMS0SLgiCEkEAjzpsR/sshCTPP8rBxF5XKLRe488C/9qIS6DsV1omJAClxRrQ4SpEAWXKtEOCufN3OrI7/54xkq+UYk+xKz0bNWUmbyiSWVCawPwFpFvS/Z/RSppG/mrKhPHVoHgxVaZTKyNXVWuU6BdO3v/xk9Gq6IRAP9dAwAAAABJRU5ErkJggg==";
    Id: string = "";
    ParentId: string = "";
    Name: string = "";
    IsParent: boolean = true;
    icon: string = this._icon;
    Child: Array<TableViewMenuEntity> = [];
    Type: MenuType = MenuType.Database;
    constructor(id?: string, name?: string, parentId?: string, child?: Array<TableViewMenuEntity>) {
        if (id) {
            this.Id = id;
        }
        if (name) {
            this.Name = name;
        }
        if (parentId) {
            this.ParentId = parentId;
        }
        if (child) {
            this.Child = child;
        }
    }
}

export class TableViewRootMenuEntity {
    private _icon: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAi0lEQVQ4T2NkoBAwwvRz1Lx3YPjL8B/G/8HOcJGhQfADIfPBBnBWv73AwMCgj674z38mw99tgiA5nABmANxmFJX/GS78/89UgFX3f4aHPzoEH+A3AL/7P3xvFRaEhwEhv+KSp8QFDN9bhRlHDRg8YVD1dsJ/hv8GpKQFRgbGC9/bhAuok5BIsRldLQDuGkERvL/MdQAAAABJRU5ErkJggg==";
    Id: string = "";
    ParentId: string = "";
    RootId: string = "";
    Database: string = "";
    Name: string = "";
    IsParent: boolean = true;
    IsTable: boolean = true;
    icon: string = this._icon;
    Child: Array<TableViewMenuEntity> = [];
    Type: MenuType = MenuType.TableViewRoot;
    constructor(id?: string, name?: string, parentId?: string, isTable?: boolean, child?: Array<TableViewMenuEntity>) {
        if (id) {
            this.Id = id;
        }
        if (name) {
            this.Name = name;
        }
        if (parentId) {
            this.ParentId = parentId;
        }
        if (isTable) {
            this.IsTable = isTable;
        }
        if (child) {
            this.Child = child;
        }
    }
}
export class TableViewMenuEntity {
    private _tableicon: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAi0lEQVQ4T2NkoBAwwvRz1Lx3YPjL8B/G/8HOcJGhQfADIfPBBnBWv73AwMCgj674z38mw99tgiA5nABmANxmFJX/GS78/89UgFX3f4aHPzoEH+A3AL/7P3xvFRaEhwEhv+KSp8QFDN9bhRlHDRg8YVD1dsJ/hv8GpKQFRgbGC9/bhAuok5BIsRldLQDuGkERvL/MdQAAAABJRU5ErkJggg==";
    private _viewicon: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABVElEQVQ4T7WTQVLCQBBFf3cqEFaGgr3cQI/ADcATEG+AO5UFYWF0J57AHEFugDcIJ1D3psAVAWqmrUkMBgotLYrZzXT3mz//1xD2XLTnPA4E8Keus1ItCDWMQk0cLW08w6/OthVvKHAupw2w7hPB2/U0EYTQPEjuqq95fQ0o9+IuA30ALgQfmuCT4qe0kbVHlNbMmmmBvwhqD2aTApxeHBLQyakauFjc1Ialq/c2M44S2xqVV9pj4D7vMWqSoHZO28OmYW5z1VmqNhE9mr3ScsZiRWTpl+LTDIQqvTgCcFIs/BUAYELwp25lpcdFiAgGSYmHpYVqMsFNgnroXMd+wQdz32RuczMzMYWoEKDW2gdBlzSPvkzsEMH/VimjuW15JtaNGDPTaEjA8c4YgTetpbu8rWfp5ClsNxuQRdQUyGnWRJESGRcHfwXsuv2nswP9hX9I+ASGhIff7GKwGwAAAABJRU5ErkJggg==";
    Id: string = "";
    ParentId: string = "";
    Name: string = "";
    RootId: string = "";
    Database: string = "";
    IsParent: boolean = false;
    IsTable: boolean = true;
    icon: string = this.GetIcon();
    Description: string = "";
    Type: MenuType = this.GetMenuType();
    constructor(id?: string, name?: string, parentId?: string, isTable?: boolean, description?: string) {
        if (id) {
            this.Id = id;
        }
        if (name) {
            this.Name = name;
        }
        if (parentId) {
            this.ParentId = parentId;
        }
        if (isTable) {
            this.IsTable = isTable;
        }
        if (description) {
            this.Description = description;
        }
    }
    private GetIcon(): string {
        return this.IsTable ? this._tableicon : this._viewicon;
    }
    private GetMenuType(): MenuType {
        return this.IsTable ? MenuType.Table : MenuType.View;
    }
}