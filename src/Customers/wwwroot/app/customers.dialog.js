///<reference path="../lib/jquery/jqueryui.d.ts" />
///<reference path="../lib/jquery/jquery.d.ts" />
System.register([], function(exports_1) {
    var autoComplete, input, dlg, saving, isNew, customerId;
    function SetDialogActive(dlg, data) {
        $('#bankaccounts_table_div :input').removeAttr('disabled');
        $('#bankaccounts_table_div').removeClass('disabled');
        $("#CustomerId").val(data["CustomerId"]);
        dlg.attr("isNew", "false");
        dlg.dialog('option', 'title', "Контрагент " + $("#form_customer input[name='CustomerName']").val());
    }
    // Открывает диалог редактирования свойств
    function OpenEditDialog(_isNew, _CustomerId, CustomerName, BusinessTypeName) {
        if (_CustomerId === void 0) { _CustomerId = null; }
        if (CustomerName === void 0) { CustomerName = null; }
        if (BusinessTypeName === void 0) { BusinessTypeName = null; }
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
                    if (isNew) {
                        // Установим все поля ввода банковских счетов неактивными, поскольку контрагент еще не записан в базу
                        $('#bankaccounts_table_div :input').attr('disabled', "true");
                        $('#bankaccounts_table_div').addClass('disabled');
                    }
                    else
                        SetDialogActive(dlg, data);
                    var panel = $("#bankaccounts_panel");
                    panel.find("input[name='NewButton']").get(0).onclick = NewBankAccountClick;
                    panel.find("input[name='EditButton']").get(0).onclick = EditBankAccountClick;
                    panel.find("input[name='DeleteButton']").get(0).onclick = DeleteBankAccountClick;
                    // Autocomplete
                    $(function () {
                        input = $("#BankName_input");
                        input.autocomplete({
                            source: 'Customers/GetAutocompleteBankList',
                            minLength: 1,
                            select: function (event, ui) {
                                ui.item ?
                                    $("#BankId_input").val(ui.item.Id) :
                                    $("#BankId_input").val("");
                            },
                            open: function () {
                                var z = window.document.defaultView.getComputedStyle(dlg.get(0)).getPropertyValue('z-index');
                                autoComplete.zIndex(z + 10);
                            }
                        });
                        autoComplete = input.autocomplete("widget");
                        autoComplete.insertAfter(dlg.parent());
                    });
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
    //Обработка событий связанных с редактирвоанием ТЧ
    function SaveData(rowdata) {
        var action;
        var rowdata;
        if (saving)
            return;
        saving = true;
        if (rowdata[3] == "") {
            action = 'Customers/AddBankAccount';
            rowdata = { BankAccountNumber: rowdata[0], BankId: rowdata[2], CustomerId: customerId };
        }
        else {
            action = 'Customers/UpdateBankAccount';
            rowdata = { BankAccountNumber: rowdata[0], BankId: rowdata[2], CustomerId: customerId, BankAccountId: rowdata[3] };
        }
        $.ajax({
            type: 'POST',
            url: action,
            data: rowdata,
            success: function (data) {
                if (data["isOk"]) {
                    // перенесем элементы редактирования обратно
                    var inputrow = $("#bankaccounts_table_inputrow");
                    $(".tableinput").parent().parent().find("input").each(function (index, value) {
                        var td = $(this).parent();
                        $(this).attr("type", "hidden");
                        inputrow.append($(this));
                        td.html($(this).val());
                    });
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
    }
    function EditRow(row, currentcell) {
        if (currentcell === void 0) { currentcell = null; }
        var cells = row.find("td");
        //var col = row.children().index(cell);
        $("#bankaccounts_table_inputrow").find("input").each(function (index, value) {
            $(this).attr("value", cells.eq(index).html());
            // сохраним в поле input в атрибуте prevVal значение ячейки до изменения
            $(this).attr("prevVal", cells.eq(index).html());
            $(this).attr("type", $(this).attr("show") == "true" ? "text" : "hidden");
            cells.eq(index).html("");
            cells.eq(index).append($(this));
        });
        if (!currentcell) {
            row.find("input").first().focus();
        }
        else {
            currentcell.find("input").first().focus();
        }
    }
    function DeleteRow(row) {
        $.ajax({
            type: 'POST',
            url: 'Customers/DeleteBankAccount',
            data: { BankAccountId: row.find("td").eq(3).html() },
            success: function (data) {
                if (data["isOk"]) {
                    row.remove();
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
    }
    // Press Добавить button
    function NewBankAccountClick() {
        // Удалим пустую строку в пустой таблице
        $('.EmptyTable tr:last').first().remove();
        $('.EmptyTable').removeClass("EmptyTable");
        $('#bankaccounts_table tr:last').after("<tr> \
       <td></td> \
       <td></td> \
       <td style='display:none;'></td> \
       <td style='display:none;'></td> \
       </tr>)");
        EditRow($('#bankaccounts_table tr:last'));
    }
    exports_1("NewBankAccountClick", NewBankAccountClick);
    // Press Изменить button
    function EditBankAccountClick() {
        EditRow($('#bankaccounts_table .highlight'));
    }
    exports_1("EditBankAccountClick", EditBankAccountClick);
    // Press Удалить button
    function DeleteBankAccountClick() {
        DeleteRow($('#bankaccounts_table .highlight'));
    }
    exports_1("DeleteBankAccountClick", DeleteBankAccountClick);
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
            // Обработка ввода с клавиатуры и указателя
            // Устанавливаем фокус на таблицу если щелкнули мышкой внутри таблицы
            $("body").click(function (e) {
                // Попытка захватить фокус если редактируется строка (нужны еще доработки)
                if (($("#bankaccounts_table_inputrow").find("input").length == 0) && (e.target.className.indexOf("tableinput") == -1)) {
                    e.preventDefault();
                    //$(":focus").focus();
                    $(".tableinput").first().focus();
                }
                else if (e.target.id == "bankaccounts_table" || $(e.target).parents("#bankaccounts_table").length) {
                    if (e.target.className.indexOf("tableinput") == -1) {
                        $("#bankaccounts_table_input").focus();
                    }
                }
            });
            //Обработка событий связанных с редактирвоанием ТЧ
            // подсвечивание строки
            $('#bankaccounts_table_div').on('click', '#bankaccounts_table > tbody > tr', function () {
                $(this).addClass('highlight').siblings().removeClass('highlight');
            });
            // двойной клик по ячейке таблицы, проиходсит вход в режим редактирования
            $('#bankaccounts_table_div').on('dblclick', '#bankaccounts_table > tbody > tr > td', function () {
                EditRow($(this).parent(), $(this));
            });
            $(document).on('keydown', function (e) {
                // если  нажата клавиша ENTER во время редактирования ячейки,
                // то необходимо сохранить введенные данные и перейти к редактированию следующей колонки
                if (e.keyCode == $.ui.keyCode.ENTER) {
                    if (e.target.className.indexOf("tableinput") > -1) {
                        e.preventDefault();
                        var input = $("#" + e.target.id);
                        var td = input.parent();
                        if (td.parent().children().index(td) < td.parent().find("input[type!='hidden']").length - 1) {
                            td.next('td').find("input").first().focus();
                        }
                        else {
                            var row = input.parent().parent();
                            var rowdata = new Array();
                            td.parent().find("input").each(function (index, value) {
                                rowdata[index] = $(this).val();
                            });
                            SaveData(rowdata);
                            $("#bankaccounts_table_input").focus();
                        }
                    }
                    else if ($("#bankaccounts_table_inputrow").children("input").length == 0) {
                        e.preventDefault();
                    }
                }
            });
            // Если нажали клавишу внутри таблицы
            $('#bankaccounts_table_input').on('keydown', function (e) {
                // перемещение фокуса строки на одну строку вниз
                if (e.keyCode == $.ui.keyCode.DOWN) {
                    e.preventDefault();
                    $('#bankaccounts_table .highlight').next().addClass('highlight').siblings().removeClass('highlight');
                }
                // перемещение фокуса строки на одну строку вверх
                if (e.keyCode == $.ui.keyCode.UP) {
                    e.preventDefault();
                    $('#bankaccounts_table .highlight').prev().addClass('highlight').siblings().removeClass('highlight');
                }
                // вход в режим редактирования ячейки при нажатии клавише ENTER
                if (e.keyCode == $.ui.keyCode.ENTER) {
                    if (e.target.className != "tableinput") {
                        e.preventDefault();
                        EditRow($('#bankaccounts_table .highlight'));
                    }
                }
            });
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
