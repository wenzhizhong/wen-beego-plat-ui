
export type Result = {
    code : number;
    message: string;
    data?: any;
};
export type ResultTable = {
    code : number;
    message: string;
    data?: {
        /** 列表数据 */
        list: Array<any>;
        /** 总条目数 */
        total?: number;
        /** 每页显示条目个数 */
        pageSize?: number;
        /** 当前页数 */
        currentPage?: number;
    };
};
