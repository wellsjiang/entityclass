import * as fs from 'fs';
import { join } from 'path';
export class StartUp {
    private static rootPath: string = join(__dirname, '../../../');
    public static async init() {
        var reult = await this.existsConfiFile();
        if (!reult) {
            fs.writeFile(join(this.rootPath, "db.json"), "[]", () => { });
        }
    }
    private static async existsConfiFile(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.exists(join(this.rootPath, "db.json"), (result) => {
                resolve(result);
            })
        })
    }
}