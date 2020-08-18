const {ipcRenderer} = window.electron;
export function converErrorCodeToMsg(error) {
    console.log(error)
    if (error.toString() === 'Error: Network Error') {
        ipcRenderer.send('open-dialog', {
            type: "error",
            title: "Error",
            message: '网络错误'
        });
        return false
    }
    ipcRenderer.send('open-dialog', {
        type: "error",
        title: "Error",
        message: error.response.data.message
    });

}