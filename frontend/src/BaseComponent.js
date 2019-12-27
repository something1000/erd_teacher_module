import {Component} from 'react';

export const sbError = {variant: 'error', persist: false, autoHideDuration: 3000};
export const sbWarning = {variant: 'warning', persist: false, autoHideDuration: 3000};
export const sbSuccess = {variant: 'success', persist: false, autoHideDuration: 3000};

class BaseComponent extends Component{

    showMsg(msg, variant){
      this.props.enqueueSnackbar(msg, variant);
    }

    showSuccess(msg){
        this.props.enqueueSnackbar(msg, sbSuccess);
      }

    showWarning(msg){
    this.props.enqueueSnackbar(msg, sbWarning);
    }

    showError(msg){
    this.props.enqueueSnackbar(msg, sbError);
    }
    
}

export const checkLogsError = "Something went wrong, check console logs for more information."
export default BaseComponent;