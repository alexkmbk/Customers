// Данный модуль загружается глобально и всегда находится в памяти
///<reference path="../lib/jquery/jquery.d.ts" />
///<reference path="./keyboard_code_enums.ts"/>
var Column = (function () {
    function Column(options) {
        if (options) {
            this.name = options.name;
            this.isVisible = options.isVisible;
        }
    }
    return Column;
})();
var Table = (function () {
    function Table(name, isEditable, columns) {
        var _this = this;
        if (columns === void 0) { columns = null; }
        this.Delete = function () {
            var rowData = new Array();
            var columns = _this.columns;
            $('.highlight > td').each(function (index, value) {
                rowData[columns[index].name] = $(this).html();
            });
            var event = new CustomEvent(_this.name + "_Delete", { 'detail': rowData });
            _this.elem.dispatchEvent(event);
        };
        this.Edit = function () {
            var rowData = new Array();
            var columns = _this.columns;
            $(_this.idSelector + ' .highlight').find("td").each(function (index, value) {
                rowData[columns[index].name] = $(this).html();
            });
            var event = new CustomEvent(_this.name + "_Pick", { 'detail': rowData });
            _this.elem.dispatchEvent(event);
        };
        this.Add = function () {
            var event = new CustomEvent(_this.name + "_New");
            _this.elem.dispatchEvent(event);
        };
        // Обработка ввода с клавиатуры 
        // Если нажали клавишу внутри таблицы
        this.Keydown = function (e) {
            // перемещение фокуса строки на одну строку вниз
            if (e.keyCode == keyCodes.DOWN_ARROW) {
                e.preventDefault();
                $(_this.idSelector + ' .highlight').next().addClass('highlight').siblings().removeClass('highlight');
            }
            // перемещение фокуса строки на одну строку вверх
            if (e.keyCode == keyCodes.UP_ARROW) {
                e.preventDefault();
                $(_this.idSelector + ' .highlight').prev().addClass('highlight').siblings().removeClass('highlight');
            }
            // вход в режим редактирования ячейки при нажатии клавише ENTER
            if (e.keyCode == keyCodes.ENTER) {
                e.preventDefault();
                _this.Edit();
            }
            // INSERT
            if (e.keyCode == keyCodes.INSERT) {
                e.preventDefault();
                _this.Add();
            }
            // DELETE
            if (e.keyCode == keyCodes.DELETE) {
                e.preventDefault();
                _this.Delete();
            }
        };
        // Устанавливаем фокус на таблицу если щелкнули мышкой внутри таблицы
        this.Click = function (e) {
            if (e.toElement.id == _this.name || $(e.toElement).parents().length) {
                $(_this.idSelector + '_input').focus();
            }
        };
        // двойной клик по ячейке таблицы, проиходсит вход в режим редактирования
        this.DblClickOnRow = function (e) {
            e.preventDefault();
            _this.Edit();
        };
        this.name = name;
        this.isEditable = isEditable;
        this.columns = columns;
        this.idSelector = '#' + name;
        this.obj = $(this.idSelector);
        this.elem = this.obj.get(0);
        $(this.idSelector + '_div').on('keydown', this.idSelector + '_input', this.Keydown);
        this.obj.on('click', "tbody", this.Click);
        $(this.idSelector + '_div').on('click', this.idSelector + ' > tbody > tr', this.ClickOnRow);
        $(this.idSelector + '_div').on('dblclick', this.idSelector + ' > tbody > tr > td', this.DblClickOnRow);
        //Выделим первую строку
        $(this.idSelector + ' > tbody > tr').first().addClass('highlight');
    }
    // подсвечивание строки
    Table.prototype.ClickOnRow = function () {
        $(this).addClass('highlight').siblings().removeClass('highlight');
    };
    ;
    return Table;
})();
