import SparkMD5 from 'spark-md5'; // 如果是模块化项目，需要导入

/**
 * 计算文件的 MD5 值 (支持大文件分块处理)
 * @param {File} file 要计算的文件对象
 * @param {Function} progressCallback 进度回调函数，参数为 0-100 的整数
 * @returns {Promise<string>} 返回文件的 MD5 值
 */
export const computeFileMD5 = (file) => {
    return new Promise((resolve, reject) => {
        const chunkSize = 2 * 1024 * 1024;
        const totalChunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;

        const spark = new SparkMD5.ArrayBuffer();
        const fileReader = new FileReader();
        function loadNext() {
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            const blob = file.slice(start, end);
            fileReader.readAsArrayBuffer(blob);
        }

        fileReader.onload = (e) => {
            spark.append(e.target.result);
            currentChunk++;
            if (currentChunk < totalChunks) {
                loadNext();
            } else {
                const fileMD5 = spark.end();
                spark.destroy();
                resolve(fileMD5);
            }
        };
        fileReader.onerror = () => {
            reject(new Error('文件读取失败'));
        };
        loadNext();
    });
};