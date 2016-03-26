// Данный модуль загружается глобально и всегда находится в памяти

///<reference path="../lib/jquery/jquery.d.ts" />
///<reference path="./keyboard_code_enums.ts"/>

class Column {
    name: string;
    isVisible: boolean;
    constructor(options?: { name: string; isVisible: boolean; }) {
        if (options) {
            this.name = options.name;
            this.isVisible = options.isVisible;
        }
    }

}

class Table {
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
        this.obj.on('click', "tbody", this.Click);
        $(this.idSelector + '_div').on('click', this.idSelector + ' > tbody > tr', this.ClickOnRow);
        $(this.idSelector + '_div').on('dblclick', this.idSelector + ' > tbody > tr > td', this.DblClickOnRow);

        //Выделим первую строку
        $(this.idSelector + ' > tbody > tr').first().addClass('highlight');

    }

    public Delete = () => {
        var rowData = new Array();
        var columns = this.columns;
        $('.highlight > td').each(function (index, value) {
            rowData[columns[index].name] = $(this).html();
        });
        var event = new CustomEvent(this.name + "_Delete", { 'detail': rowData });
        this.elem.dispatchEvent(event);
    };

    public Edit = () => {
        var rowData = new Array();
        var columns = this.columns;
        $(this.idSelector + ' .highlight').find("td").each(function (index, value) {
            rowData[columns[index].name] = $(this).html();
        });
        var event = new CustomEvent(this.name + "_Pick", { 'detail': rowData });
        this.elem.dispatchEvent(event);
    }

    public Add = () => {
        var event = new CustomEvent(this.name + "_New");
        this.elem.dispatchEvent(event);
    }

    // Обработка ввода с клавиатуры 

    // Если нажали клавишу внутри таблицы
    Keydown = (e: KeyboardEvent) => {
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
            this.Edit();
        }

        // INSERT
        if (e.keyCode == keyCodes.INSERT) {
            e.preventDefault();
            this.Add();
        }

        // DELETE
        if (e.keyCode == keyCodes.DELETE) {
            e.preventDefault();
            this.Delete();
        }
    };

    // Устанавливаем фокус на таблицу если щелкнули мышкой внутри таблицы
    Click = (e: MouseEvent) => {
        if (e.toElement.id == this.name || $(e.toElement).parents().length) {
            $(this.idSelector + '_input').focus();
        }
    };

    // подсвечивание строки
    ClickOnRow() {
        $(this).addClass('highlight').siblings().removeClass('highlight');
    };

    // двойной клик по ячейке таблицы, проиходсит вход в режим редактирования
    DblClickOnRow = (e: MouseEvent) => {
        e.preventDefault();
        this.Edit();
    };
}