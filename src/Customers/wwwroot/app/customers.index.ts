﻿/// <reference path="./customers.dialog.ts" />


import * as CustomersDialog from "./customers.dialog";

var customers_table: Table;

function InitCustomersTable() {

    var cols: Column[] = [new Column({ name: "CustomerId", isVisible: false }),
        new Column({ name: "CustomerName", isVisible: true }),
        new Column({ name: "BusinessTypeName", isVisible: true })];

    customers_table = new Table("customers_table", false, cols, $(window));

    var panel = $("#customers_panel");
    panel.find("input[name='AddButton']").get(0).onclick = customers_table.Add;
    panel.find("input[name='EditButton']").get(0).onclick = customers_table.Edit;
    panel.find("input[name='DeleteButton']").get(0).onclick = customers_table.BeforeDelete;


    panel = $("#dialog_customer_panel");
    panel.find("input[name='SaveAndCloseButton']").get(0).onclick = CustomersDialog.SaveAndClose;
    panel.find("input[name='SaveButton']").get(0).onclick = CustomersDialog.Save;

}

InitCustomersTable();

window.addEventListener("customers_table_Pick", function (e: any) {
    var rowdata: Array<any> = e.detail;
    CustomersDialog.OpenEditDialog(false, rowdata['CustomerId'], rowdata['CustomerName'], rowdata['BusinessTypeName'], window);
});

window.addEventListener("customers_table_New", function (e: any) {
    CustomersDialog.OpenEditDialog(true, null, null, null, window);
});

//Удалить запись
window.addEventListener("customers_table_BeforeDelete", function (e: any) {
    window.location.href = "/Customers/Delete?CustomerId=" + e.detail['CustomerId'];
});

window.addEventListener("customers_table_AfterSave", function (e: any) {
    InitCustomersTable();
});