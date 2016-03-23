///<reference path="./jquery.d.ts" />
///<reference path="./keyboard_code_enums.ts"/>

/*import jQuery = require('jquery');

    export interface Column {
        name: string;
        isVisible: boolean;
    }

    export class Table {
        name: string;
        isEditable: boolean;
        columns: Column[];
        idSelector: string;
        obj: JQuery;
        elem: HTMLElement;

        constructor(name: string, isEditable: boolean, columns: Column[] = null) {
            this.name = name;
            this.isEditable = isEditable;
            this.columns = columns;
            this.idSelector = '#' + name;
            this.obj = $(this.idSelector);
            this.elem = this.obj.get(0);
            $(this.idSelector + '_div').on('keydown', this.idSelector + '_input', this.Keydown);
            this.obj.on('click', "body", this.Click);
            $(this.idSelector + '_div').on('click', this.idSelector + ' > tbody > tr', this.ClickOnRow);
            $(this.idSelector + '_div').on('dblclick', this.idSelector + ' > tbody > tr > td', this.DblClickOnRow);
        }

        // Обработка ввода с клавиатуры 

        // Если нажали клавишу внутри таблицы
        Keydown(e: KeyboardEvent) {
            // перемещение фокуса строки на одну строку вниз
            if (e.keyCode == keyCodes.DOWN_ARROW) {
                e.preventDefault();
                $(this.idSelector + ' .highlight').next().addClass('highlight').siblings().removeClass('highlight');
            }

            // перемещение фокуса строки на одну строку вверх
            if (e.keyCode == keyCodes.UP_ARROW) {
                e.preventDefault();
                $(this.idSelector + ' .highlight').prev().addClass('highlight').siblings().removeClass('highlight');
            }
            // вход в режим редактирования ячейки при нажатии клавише ENTER
            if (e.keyCode == keyCodes.ENTER) {
                e.preventDefault();
                var rowdata = new Array();
                $(this.idSelector + ' .highlight').find("td").each(function (index, value) {
                    rowdata[index] = $(this).html();
                });

                var event = new CustomEvent(this.name + "Pick", { 'detail': rowdata });
                this.elem.dispatchEvent(event);
            }
        };

        // Устанавливаем фокус на таблицу если щелкнули мышкой внутри таблицы
        Click(e: MouseEvent) {
            if (e.toElement.id == this.name || $(e.toElement).parents().length) {
                $(this.idSelector + '_input').focus();
            }
        };

        // подсвечивание строки
        ClickOnRow() {
            $(this).addClass('highlight').siblings().removeClass('highlight');
        };

        // двойной клик по ячейке таблицы, проиходсит вход в режим редактирования
        DblClickOnRow() {
            var rowdata = new Array();
            $(this.idSelector + ' .highlight').find("td").each(function (index, value) {
                rowdata[index] = $(this).html();
            });

            var event = new CustomEvent(this.name + "_Pick", { 'detail': rowdata });
            this.elem.dispatchEvent(event);

        };


        /*
            // Обработка ввода с клавиатуры
            // нажатие ENTER в поле CustomerName - переход на следующее поле
            Keypress(e: KeyboardEvent) {
                if (e.keyCode == keyCodes.ENTER) {
                    e.preventDefault();
                    $("#dialog_customer select[name='BusinessTypeName']").focus();
                }
            };
        
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
        
            // Если отжали INSERT внутри командной панели таблицы
            $('#customers_table_input').on('keyup', function(e) {
                if (e.keyCode == 45) {
                    e.preventDefault();
                    NewClick();
                }
            });
        
        
            // Устанавливаем фокус на таблицу если щелкнули мышкой внутри таблицы
            $("body").click(function (e) {
                if (e.target.id == "customers_table" || $(e.target).parents("#customers_table").size()) {
                    $("#customers_table_input").focus();
                }
            });
        
            // подсвечивание строки
            $('#customers_table_div').on('click','#customers_table > tbody > tr', function() {
                $(this).addClass('highlight').siblings().removeClass('highlight');
            });
        
            // двойной клик по ячейке таблицы, проиходсит вход в режим редактирования
            $('#customers_table_div').on('dblclick','#customers_table > tbody > tr > td', function() {
                var rowdata = new Array();
                $(this).parent().find("td").each(function (index, value) {
                    rowdata[index] = $(this).html();
                });
                OpenEditDialog(rowdata[0], rowdata[1], rowdata[2]);
            });
        
        
            // Обработка ввода с клавиатуры
        
            // Если нажали клавишу внутри таблицы
            $('#customers_table_div').on('keydown','#customers_table_input', function(e) {
                // перемещение фокуса строки на одну строку вниз
                if (e.keyCode == $.ui.keyCode.DOWN) {
                    e.preventDefault();
                    $('#customers_table .highlight').next().addClass('highlight').siblings().removeClass('highlight');
                }
        
                // перемещение фокуса строки на одну строку вверх
                if (e.keyCode == $.ui.keyCode.UP) {
                    e.preventDefault();
                    $('#customers_table .highlight').prev().addClass('highlight').siblings().removeClass('highlight');
                }
                // вход в режим редактирования ячейки при нажатии клавише ENTER
                if (e.keyCode == $.ui.keyCode.ENTER) {
                    e.preventDefault();
                    var rowdata = new Array();
                    $('#customers_table .highlight').find("td").each(function (index, value) {
                        rowdata[index] = $(this).html();
                    });
                    OpenEditDialog(rowdata[0], rowdata[1], rowdata[2]);
                }
            });*/
    //}

   