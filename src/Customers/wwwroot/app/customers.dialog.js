///<reference path="../lib/jquery/jqueryui.d.ts" />
///<reference path="../lib/jquery/jquery.d.ts" />
System.register([], function(exports_1) {
    var autoComplete, input, dlg, saving, isNew, customerId, accountdialog_table;
    function SetDialogActive(dlg, data) {
        $('#bankaccounts_table_div :input').removeAttr('disabled');
        $('#bankaccounts_table_div').removeClass('disabled');
        $("#CustomerId").val(data["CustomerId"]);
        dlg.attr("isNew", "false");
        dlg.dialog('option', 'title', "Контрагент " + $("#form_customer input[name='CustomerName']").val());
    }
    function InitDialog() {
        var cols = [new Column({ name: "BankAccountNumber", isVisible: true }),
            new Column({ name: "BankName", isVisible: true, isAutoComplete: true, AutoCompleteSource: "Customers/GetAutocompleteBankList", AutoCompleteID: "BankId" }),
            new Column({ name: "BankId", isVisible: false }),
            new Column({ name: "BankAccountId", isVisible: false })];
        accountdialog_table = new Table("bankaccounts_table", true, cols, dlg, cols[3]);
        var panel = $("#bankaccounts_panel");
        panel.find("input[name='NewButton']").get(0).onclick = accountdialog_table.Add;
        panel.find("input[name='EditButton']").get(0).onclick = accountdialog_table.Edit;
        panel.find("input[name='DeleteButton']").get(0).onclick = accountdialog_table.BeforeDelete;
        var dlgform = $("#form_customer").get(0).onsubmit = SaveAndClose;
        dlg.dialog({
            width: "50%",
            beforeClose: function (e, ui) {
                // если нажата клавиша ESC и выполняется редактирование ячейки,
                // то необходимо завершить редактирование не сохраняя введенные данные
                if (e.keyCode == 27) {
                    var inputrow = $("#bankaccounts_table_inputrow");
                    if (inputrow.children("input").length == 0) {
                        e.preventDefault();
                        var td;
                        // перенесем элементы редактирования обратно
                        var inputrow = $("#bankaccounts_table_inputrow");
                        $(".tableinput").parent().parent().find("input").each(function (index, value) {
                            td = $(this).parent();
                            $(this).attr("type", "hidden");
                            inputrow.append($(this));
                            td.html($(this).attr("prevVal"));
                        });
                        if (td.parent().children().eq(3).html() == "") {
                            td.parent().remove();
                        }
                        $("#bankaccounts_table_input").focus();
                    }
                }
            }
        });
        //Удалить запись
        $('#bankaccounts_table').get(0).addEventListener("bankaccounts_table_BeforeDelete", function (e) {
            var rowdata = e.detail;
            $.ajax({
                type: 'POST',
                url: 'Customers/DeleteBankAccount',
                data: { BankAccountId: rowdata['BankAccountId'] },
                success: function (data) {
                    if (data["isOk"]) {
                        accountdialog_table.Delete(); // удалить строку в диалоге
                    }
                    else {
                        var myDiv = document.getElementById("dialog_customer_divmsg");
                        myDiv.innerHTML = "Ошибка записи: " + data["Errors"];
                    }
                },
                error: function (xhr, str) {
                    var myDiv = document.getElementById("dialog_customer_divmsg");
                    myDiv.innerHTML = "Ошибка записи: " + xhr.responseText;
                }
            });
        });
        $('#bankaccounts_table').get(0).addEventListener("bankaccounts_table_SaveTable", function (e) {
            var action;
            var rowdata;
            if (saving)
                return;
            saving = true;
            if (e.detail["BankAccountId"] == "") {
                action = 'Customers/AddBankAccount';
                rowdata = { BankAccountNumber: e.detail["BankAccountNumber"], BankId: e.detail["BankId"], CustomerId: customerId };
            }
            else {
                action = 'Customers/UpdateBankAccount';
                rowdata = { BankAccountNumber: e.detail["BankAccountNumber"], BankId: e.detail["BankId"], CustomerId: customerId, BankAccountId: e.detail["BankAccountId"] };
            }
            $.ajax({
                type: 'POST',
                url: action,
                data: rowdata,
                success: function (data) {
                    if (data["isOk"]) {
                        accountdialog_table.EndEditing(data["BankAccountId"]);
                        saving = false;
                    }
                    else {
                        var myDiv = document.getElementById("dialog_customer_divmsg");
                        myDiv.innerHTML = "Ошибка записи: " + data["Errors"];
                        saving = false;
                    }
                },
                error: function (xhr, str) {
                    var myDiv = document.getElementById("dialog_customer_divmsg");
                    myDiv.innerHTML = "Ошибка записи: " + xhr.responseText;
                    saving = false;
                }
            });
        });
    }
    // Открывает диалог редактирования свойств
    function OpenEditDialog(_isNew, _CustomerId, CustomerName, BusinessTypeName) {
        if (_CustomerId === void 0) { _CustomerId = null; }
        if (CustomerName === void 0) { CustomerName = null; }
        if (BusinessTypeName === void 0) { BusinessTypeName = null; }
        var myDiv = document.getElementById("dialog_customer_divmsg").innerHTML = "";
        // Удалим ранее созданный диалог, чтобы очистить все свойства
        if (dlg.hasClass('ui-dialog-content')) {
            dlg.dialog('destroy');
        }
        if (!_isNew) {
            dlg.find("input[name='CustomerName']").val(CustomerName);
            dlg.find("input[name='CustomerId']").val(_CustomerId);
            dlg.find("select[name='BusinessTypeName']").val(BusinessTypeName);
            dlg.attr('CustomerId', customerId);
            dlg.attr('title', 'Контрагент ' + CustomerName);
            customerId = _CustomerId;
        }
        else
            dlg.attr('title', 'Создание нового контрагента');
        // устанавливаем признак что запись уже существует, просто редактируем
        dlg.attr('isNew', +_isNew);
        isNew = _isNew;
        // установим атрибут со значением ID чтобы обновить потом запись в БД
        $.ajax({
            type: 'GET',
            url: 'Customers/GetBankAccountsForEdit',
            data: { 'CustomerId': customerId },
            success: function (data) {
                // Если запрос выполнен без ошибок то присваиваем полученный с сервера html код, элементу BankAccountsTable
                if (data["isOk"]) {
                    $('#bankaccounts_table_div').html(data["view"]);
                    InitDialog();
                    if (isNew) {
                        // Установим все поля ввода банковских счетов неактивными, поскольку контрагент еще не записан в базу
                        $('#bankaccounts_table_div :input').attr('disabled', "true");
                        $('#bankaccounts_table_div').addClass('disabled');
                    }
                    else
                        SetDialogActive(dlg, data);
                }
                else {
                    // Если запрос обработан, но произошла ошибка, то устанавливаем текст ошибки в элементе dialog_customer_divmsg
                    //расположенном здесь, же на форме диалога, чтобы пользователь мог видеть сообщение
                    var myDiv = document.getElementById("dialog_customer_divmsg");
                    myDiv.innerHTML = "Ошибка полученния списка банковских счетов: " + data["Errors"];
                }
            },
            // если запрос не удалось обработать
            error: function (xhr, str) {
                var myDiv = document.getElementById("dialog_customer_divmsg");
                myDiv.innerHTML = "Ошибка полученния списка банковских счетов: " + xhr.responseText;
            }
        });
    }
    exports_1("OpenEditDialog", OpenEditDialog);
    function Save() {
        SaveChanges(false);
    }
    exports_1("Save", Save);
    function SaveAndClose() {
        SaveChanges(true);
    }
    exports_1("SaveAndClose", SaveAndClose);
    // Save changes
    function SaveChanges(close) {
        if (close === void 0) { close = false; }
        // validation form on client side
        var errors = "";
        if ($("#form_customer input[name='CustomerName']").val().length == 0) {
            errors = "Не задано имя контрагента";
        }
        var myDiv = document.getElementById("dialog_customer_divmsg");
        if (errors.length != 0) {
            myDiv.innerHTML = errors;
            return;
        }
        else
            myDiv.innerHTML = "";
        // Здесь по атрибуту isNew, определяется что это новая запись или уже существующая
        // в зависимости от этого будет вызываться различный метод контроллера: Add или Update
        var action;
        var isNew = document.getElementById('dialog_customer').getAttribute("isNew");
        if (isNew == "true")
            action = 'Customers/Add';
        else
            action = 'Customers/Update?CustomerId=' + customerId;
        var msg = $('#form_customer').serialize();
        $.ajax({
            type: 'POST',
            url: action,
            data: msg,
            success: function (data) {
                // Если запрос выполнен без ошибок то присваиваем полученный с сервера html код, элементу customers_table
                if (data["isOk"]) {
                    var dlg = $('#dialog_customer');
                    if (close)
                        dlg.dialog('close');
                    if (close) {
                        $('#customers_table_div').html(data["view"]);
                        $('#customers_table_input').focus();
                        dlg.dialog('destroy');
                    }
                    else {
                        $('#customers_table_div').html(data["view"]);
                        if (isNew == "true") {
                            // Установим все поля ввода банковских счетов активными, поскольку контрагент уже записан в базу
                            SetDialogActive(dlg, data);
                        }
                    }
                }
                else {
                    //Если запрос обработан, но произошла ошибка, то устанавливаем текст ошибки в элементе dialog_customer_divmsg
                    //расположенном здесь, же на форме диалога, чтобы пользователь мог видеть сообщение
                    var myDiv = document.getElementById("dialog_customer_divmsg");
                    myDiv.innerHTML = "Ошибка записи: " + data["Errors"];
                }
            },
            statusCode: {
                401: function (response) {
                    document.location.hostname = "/Account/Login?returnUrl=/Customers/Index";
                }
            },
            // если запрос не удалось обработать
            error: function (xhr, str) {
                var myDiv = document.getElementById("dialog_customer_divmsg");
                myDiv.innerHTML = "Ошибка записи: " + xhr.responseCode;
            }
        });
    }
    function msg(str) {
        var myDiv = document.getElementById("dialog_customer_divmsg");
        myDiv.innerHTML = str;
    }
    return {
        setters:[],
        execute: function() {
            dlg = $("#dialog_customer");
            saving = false;
            isNew = true;
            // Обработка ввода с клавиатуры
            // нажатие ENTER в поле CustomerName - переход на следующее поле
            dlg.find("input[name='CustomerName']").keypress(function (e) {
                if (e.keyCode == $.ui.keyCode.ENTER) {
                    e.preventDefault();
                    $("#dialog_customer select[name='BusinessTypeName']").focus();
                }
            });
            // нажатие ENTER в поле BusinessTypeName - переход на кнопку submit
            dlg.find("select[name='BusinessTypeName']").keypress(function (e) {
                if (e.keyCode == $.ui.keyCode.ENTER) {
                    e.preventDefault();
                    $("#dialog_customer input[type='submit']").focus();
                }
            });
            // Если  нажато сочетание ctrl+Enter тогда сохраняем данные и закрываем диалог
            dlg.keypress(function (e) {
                if (e.ctrlKey && e.keyCode == 10) {
                    e.preventDefault();
                    SaveChanges();
                }
            });
        }
    }
});
