export class CommonMsg {
    Error: any;
    IsSuccess: boolean = false;
    Message: string = "";
    Data: any;
    constructor(isSuccess: boolean, msg?: string, data?: any, error?: any) {
        this.IsSuccess = isSuccess;
        this.Message = msg === undefined ? "" : msg;
        this.Data = data === undefined ? null : data;
        this.Error = error === undefined ? null : error;
    }
}
