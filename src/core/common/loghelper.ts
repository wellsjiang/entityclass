import * as LogJs from 'log4js';
import { LogType } from '../../model/enum/enumcollection';
export class LogHelper {
    private static readonly Instance: LogHelper = new LogHelper();
    private static readonly Logger: LogJs.Logger = LogJs.configure({
        appenders: { cheese: { type: 'console' } },
        categories: { default: { appenders: ['cheese'], level: 'debug' } }
    }).getLogger();

    private Log() {
    }

    public static info(message: string) {
        this.Instance.LogMsg(message, LogType.info);
    }
    public static debug(message: string) {
        this.Instance.LogMsg(message, LogType.debug);
    }
    public static warn(message: string) {
        this.Instance.LogMsg(message, LogType.warn);
    }
    public static error(message: string) {
        this.Instance.LogMsg(message, LogType.error);
    }
    public static fatal(message: string) {
        this.Instance.LogMsg(message, LogType.fatal);
    }
    private async LogMsg(message: string, type: LogType) {
        switch (type) {
            case LogType.info:
                LogHelper.Logger.info(message);
                break;
            case LogType.debug:
                LogHelper.Logger.debug(message);
                break;
            case LogType.warn:
                LogHelper.Logger.warn(message);
                break;
            case LogType.error:
                LogHelper.Logger.error(message);
                break;
            case LogType.fatal:
                LogHelper.Logger.fatal(message);
                break;
        }
    }
}