// Данный модуль загружается глобально и всегда находится в памяти

///<reference path="../lib/jquery/jquery.d.ts" />
///<reference path="./keyboard_code_enums.ts"/>

interface ColumnOptions {
    name: string;
    isVisible: boolean;
    isAutoComplete?: boolean;
    AutoCompleteSource?: string;
    AutoCompleteID?: string;
}

function SetAutoComplete(input: JQuery, col: Column, table: Table) {
    //var parentForm = this.parentForm;

    input.autocomplete({
        source: col.AutoCompleteSource,
        minLength: 1,
        select: function (event, ui) {
            ui.item ?
                $("#" + col.AutoCompleteID + "_input").val(ui.item.Id) :
                $("#" + col.AutoCompleteID + "_input").val("");
        },
        open: function () {
            var z = window.document.defaultView.getComputedStyle(table.parentForm.get(0)).getPropertyValue('z-index');
            table.autoComplete.zIndex(10 + (+z));
        },
    });
    table.autoComplete = input.autocomplete("widget");
    table.autoComplete.insertAfter(table.parentForm);
}

class Column {
    name: string;
    isVisible: boolean;
    isAutoComplete: boolean;
    AutoCompleteSource: string;
    AutoCompleteID: string;
    constructor(options: ColumnOptions) {
        if (options) {
            this.name = options.name;
            this.isVisible = options.isVisible;
            this.isAutoComplete = options.isAutoComplete; 
            this.AutoCompleteSource = options.AutoCompleteSource;
            this.AutoCompleteID = options.AutoCompleteID;
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
    inEditing: boolean;
    autoComplete: JQuery;
    public parentForm: JQuery;

    IdColumn: Column;

    constructor(name: string, isEditable: boolean, columns: Column[] = null, parentForm = null, IdColumn: Column = null) {


        this.name = name;
        this.isEditable = isEditable;
        this.columns = columns;
        this.idSelector = '#' + name;
        this.obj = $(this.idSelector);
        this.elem = this.obj.get(0);
        this.inEditing = false;
        this.parentForm = parentForm;
        this.IdColumn = IdColumn;
        var parent: JQuery = $(this.elem.parentNode);

        parent.on('keydown', this.idSelector + '_input', this.Keydown);
        this.obj.on('click', "tbody", this.Click);
        parent.on('click', this.idSelector + ' > tbody > tr', this.ClickOnRow);
        parent.on('dblclick', this.idSelector + ' > tbody > tr > td', this.DblClickOnRow);
        parent.on('keydown', '.tableinput', this.InputKeydown);

        $(document).on('click', this.DocClick);

        //Выделим первую строку
        this.obj.find('tbody > tr').first().addClass('highlight');
      }

    

    public BeforeDelete = () => {
        var rowData = new Array();
        var columns = this.columns;
        this.obj.find('.highlight > td').each(function (index, value) {
            rowData[columns[index].name] = $(this).html();
        });
        var event = new CustomEvent(this.name + "_BeforeDelete", { 'detail': rowData });
        this.elem.dispatchEvent(event);
    };

    public Delete() {
        this.obj.find('.highlight > td').remove();
        this.obj.find('tbody > tr').first().addClass('highlight');
}


    public Edit = () => {
        this.EditCell(null);
    }


    public EditCell = (_row: JQuery = null, currentcell: JQuery = null) => {
        var rowData = new Array();
        var columns = this.columns;
        var isEditable = this.isEditable;
        var row: JQuery;
        //var SetAutoComplete = this.SetAutoComplete;
        if (_row == null)
            row = $(this.idSelector + ' .highlight');
        else row = _row;
        var table = this;

        row.find("td").each(function (index, value) {
            var cell = $(this);
            var val;
            var input: JQuery;
            var col: Column = columns[index];
            // Обработка непонятной ситуации, когда, почему-то 
            // остается не удаленным элемент редактирования
            if (cell.find("input").length != 0) {
                input = cell.find("input");
                val = input.val();
                if (col.isAutoComplete) {
                    $(this).autocomplete("destroy");
                    $(this).removeData('autocomplete');
                }
                input.remove(); 
                cell.html("");    
            }
            else
                val = cell.html();

            rowData[col.name] = val;

            if (isEditable) {
                input = $(document.createElement('input'));
                input.attr("id", col.name + "_input");
                input.attr("value", val);
                input.attr("prevVal", val);
                input.attr("type", col.isVisible ? "text" : "hidden");
                input.addClass("tableinput");
                cell.html("");
                cell.append(input);
                if (col.isAutoComplete) {
                    SetAutoComplete(input, col, table);
                }
            }
        });

        if (isEditable) {
            if (currentcell == null) {
                row.find("input").first().focus();
            }
            else {
                currentcell.find("input").first().focus();
            }
            this.inEditing = true;
        }
        var event = new CustomEvent(this.name + "_Pick", { 'detail': rowData });
        this.elem.dispatchEvent(event);
    }

    public WasChanged = () => {
        this.obj.find(".tableinput").each(function (index, value) {
            if ($(this).attr("prevVal") != $(this).val())
                return true; 
        });
        return false;
    }

    public Add = () => {

        // Удалим пустую строку в пустой таблице
        $('.EmptyTable tr:last').first().remove();
        $('.EmptyTable').removeClass("EmptyTable");

        var emptyRowStr = "<tr>";
        for (var i = 0; i < this.columns.length; i++) {
            emptyRowStr = emptyRowStr + (this.columns[i].isVisible ? "<td></td>" : "<td style='display:none;'></td>");
        }
        emptyRowStr = emptyRowStr + "</tr>";

        this.obj.find('tr:last').first().after(emptyRowStr);
        this.EditCell(this.obj.find('tr:last').first());

        var event = new CustomEvent(this.name + "_New");
        this.elem.dispatchEvent(event);
    }

    public EndEditing = (ColIdValue) => {
        var columns = this.columns;
        if (ColIdValue) $("#" + this.IdColumn.name + "_input").val(ColIdValue);
        this.obj.find(".tableinput").parent().parent().find("input").each(function (index, value) {
            var td = $(this).parent();
            var val = $(this).val();

            if (columns[index].isAutoComplete) {
                $(this).autocomplete("destroy");
                $(this).removeData('autocomplete');
            }

            $(this).remove();
            td.html(val);
        });

    }

    // Обработка ввода с клавиатуры 

    InputKeydown = (e: any) => {

        // вход в режим редактирования ячейки при нажатии клавише ENTER
        if (e.keyCode == keyCodes.ENTER) {
            e.preventDefault();
            var input: JQuery = $((<Element>e.target));
            var td = input.parent();
            
            if (td.parent().children().index(td) < td.parent().find("input[type!='hidden']").length - 1) {
                td.next('td').find("input").first().focus();
            }
            else {
                var row = input.parent().parent();
                var rowData = new Array();
                var columns = this.columns;
                td.parent().find("input").each(function (index, value) {
                    //rowdata[index] = $(this).val();
                    rowData[columns[index].name] = $(this).val();
                });

                var event = new CustomEvent(this.name + "_SaveTable", { 'detail': rowData });
                this.elem.dispatchEvent(event);
                $(this.idSelector + "_input").focus();
            }
        }
    }

    // Если нажали клавишу внутри таблицы
    Keydown = (e: KeyboardEvent) => {
        // перемещение фокуса строки на одну строку вниз
        if (e.keyCode == keyCodes.DOWN_ARROW) {
            e.preventDefault();
            $(this.idSelector + ' .highlight').next().addClass('highlight').siblings().removeClass('highlight');
        }

        // перемещение фокуса строки на одну строку вверх
        else if (e.keyCode == keyCodes.UP_ARROW) {
            e.preventDefault();
            $(this.idSelector + ' .highlight').prev().addClass('highlight').siblings().removeClass('highlight');
        }
  
        // INSERT
        else if (e.keyCode == keyCodes.INSERT) {
            e.preventDefault();
            this.Add();
        }

        // DELETE
        else if (e.keyCode == keyCodes.DELETE) {
            e.preventDefault();
            this.Delete();
        }

        else if (e.keyCode == keyCodes.ENTER) {
            e.preventDefault();
            this.Edit();
        }
    };

    DocClick = (e: MouseEvent) => {
        if (this.inEditing && (!(e.toElement.classList.contains(".tableinput")))) {
            if (this.WasChanged()) {
                e.preventDefault();
                this.obj.find(".tableinput").first().focus();
            }
            else
                this.EndEditing(undefined);
        } 
    }

    // Устанавливаем фокус на таблицу если щелкнули мышкой внутри таблицы
    Click = (e: MouseEvent) => {
        
        if ((e.toElement.id == this.name || $(e.toElement).parents().length) && ($(e.target).prop("tagName").toLowerCase()!="input")) {
                $(this.idSelector + '_input').focus();
            }
    };

    // подсвечивание строки
    ClickOnRow = (e: MouseEvent) => {

        var target: JQuery = $(e.target);
        var tagName = target.prop("tagName").toLowerCase();
        var targetRow;
        if (tagName == "input")
            targetRow = target.parent().parent();
        else
            targetRow = target.parent();

        targetRow.addClass('highlight').siblings().removeClass('highlight');

        if (this.isEditable) {
            // Попытка захватить фокус если редактируется строка (нужны еще доработки)
            if ((this.inEditing) && (e.toElement.className.indexOf("tableinput") == -1)) {
                e.preventDefault();
                //$(":focus").focus();
                this.obj.find(".tableinput").first().focus();
            }
            /*else if (e.target.id == this.name || target.parents(this.idSelector).length) {
                if (e.target.className.indexOf("tableinput") == -1) {
                    $(this.idSelector + "_input").focus();
                }

            }*/
        }

    };

    // двойной клик по ячейке таблицы, проиходсит вход в режим редактирования
    DblClickOnRow = (e: MouseEvent) => {
        e.preventDefault();
        this.Edit();
    };
}