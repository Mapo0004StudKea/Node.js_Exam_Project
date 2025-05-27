export function configureToastr() {
  toastr.options = {
    positionClass: 'toast-bottom-left',
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    preventDuplicates: false,
    showDuration: '300',
    hideDuration: '1000',
    timeOut: '5000'
  };
}