/// <reference path="./customers.dialog.ts" />
System.register(["./customers.dialog"], function(exports_1) {
    var CustomersDialog;
    var cols, customers_table, panel;
    return {
        setters:[
            function (CustomersDialog_1) {
                CustomersDialog = CustomersDialog_1;
            }],
        execute: function() {
            cols = [new Column({ name: "CustomerId", isVisible: false }),
                new Column({ name: "CustomerName", isVisible: true }),
                new Column({ name: "BusinessTypeName", isVisible: true })];
            customers_table = new Table("customers_table", false, cols);
            panel = $("#customers_panel");
            panel.find("input[name='AddButton']").get(0).onclick = customers_table.Add;
            panel.find("input[name='EditButton']").get(0).onclick = customers_table.Edit;
            panel.find("input[name='DeleteButton']").get(0).onclick = customers_table.BeforeDelete;
            panel = $("#dialog_customer_panel");
            panel.find("input[name='SaveAndCloseButton']").get(0).onclick = CustomersDialog.SaveAndClose;
            panel.find("input[name='SaveButton']").get(0).onclick = CustomersDialog.Save;
            $('#customers_table').get(0).addEventListener("customers_table_Pick", function (e) {
                var rowdata = e.detail;
                CustomersDialog.OpenEditDialog(false, rowdata['CustomerId'], rowdata['CustomerName'], rowdata['BusinessTypeName']);
            });
            $('#customers_table').get(0).addEventListener("customers_table_New", function (e) {
                CustomersDialog.OpenEditDialog(true);
            });
            //Удалить запись
            $('#customers_table').get(0).addEventListener("customers_table_BeforeDelete", function (e) {
                window.location.href = "/Customers/Delete?CustomerId=" + e.detail['CustomerId'];
            });
        }
    }
});
