///<reference path="../lib/jquery/jqueryui.d.ts" />
System.register([], function(exports_1) {
    function SetDialogActive(dlg, data) {
        $('#bankaccounts_table_div :input').removeAttr('disabled');
        $('#bankaccounts_table_div').removeClass('disabled');
        $("#CustomerId").val(data["CustomerId"]);
        dlg.attr("isNew", false);
        dlg.dialog('option', 'title', "Контрагент " + $("#form_customer input[name='CustomerName']").val());
    }
    // Открывает диалог редактирования свойств
    function OpenEditDialog(isNew, CustomerId, CustomerName, BusinessTypeName) {
        if (CustomerId === void 0) { CustomerId = null; }
        if (CustomerName === void 0) { CustomerName = null; }
        if (BusinessTypeName === void 0) { BusinessTypeName = null; }
        // Удалим ранее созданный диалог, чтобы очистить все свойства
        var dlg = $("#dialog_customer");
        if (dlg.hasClass('ui-dialog-content')) {
            dlg.dialog('destroy');
        }
        if (!isNew) {
            dlg.find("input[name='CustomerName']").val(CustomerName);
            dlg.find("input[name='CustomerId']").val(CustomerId);
            dlg.find("select[name='BusinessTypeName']").val(BusinessTypeName);
            dlg.attr('CustomerId', CustomerId);
        }
        if (isNew)
            dlg.attr('title', 'Создание нового контрагента');
        else
            dlg.attr('title', 'Контрагент ' + CustomerName);
        // устанавливаем признак что запись уже существует, просто редактируем
        dlg.attr('isNew', isNew);
        // установим атрибут со значением ID чтобы обновить потом запись в БД
        $.ajax({
            type: 'GET',
            url: 'Customers/GetBankAccountsForEdit',
            data: { 'CustomerId': CustomerId },
            success: function (data) {
                // Если запрос выполнен без ошибок то присваиваем полученный с сервера html код, элементу BankAccountsTable
                if (data["isOk"]) {
                    $('#bankaccounts_table_div').html(data["view"]);
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
        dlg.dialog({ width: "50%" });
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
            action = 'Customers/Update';
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
    return {
        setters:[],
        execute: function() {
            ;
            // Обработка ввода с клавиатуры
            // нажатие ENTER в поле CustomerName - переход на следующее поле
            $("#dialog_customer input[name='CustomerName']").keypress(function (e) {
                if (e.keyCode == $.ui.keyCode.ENTER) {
                    e.preventDefault();
                    $("#dialog_customer select[name='BusinessTypeName']").focus();
                }
            });
            // нажатие ENTER в поле BusinessTypeName - переход на кнопку submit
            $("#dialog_customer select[name='BusinessTypeName']").keypress(function (e) {
                if (e.keyCode == $.ui.keyCode.ENTER) {
                    e.preventDefault();
                    $("#dialog_customer input[type='submit']").focus();
                }
            });
            // Если  нажато сочетание ctrl+Enter тогда сохраняем данные и закрываем диалог
            $("#dialog_customer").keypress(function (e) {
                if (e.ctrlKey && e.keyCode == 10) {
                    e.preventDefault();
                    SaveChanges();
                }
            });
        }
    }
});
