
/* Table */


$wb.ui.TableRow = $wb.Class('TableRow',
    {
        __extends:[$wb.ui.Widget,$wb.ui.form.FieldContainer],
        __defaults:{
            editable:false,
            data:{}
        },
        _editMode:false,
        _fields:[],
        __construct:function(opts) {
            this.require(opts,'table');
            this.__super($.extend({
                tmpl:opts.table.option('rowTmpl')
            },this.getDefaults(opts)));
            var self = this;
            this.elm().dblclick(function(evt) {
                if (!self.opts.editable) return;
                evt.preventDefault();
                evt.stopPropagation();
                this.makeEditable();
            }.bind(this));
            
            this.bind('paint',function() {
                if (this._editMode) {
                    this._editRow();
                } else {
                    this._viewRow();
                }
            });
            this.bind('render',function() {
                if (this._editMode) {
                    for(var i = 0; i < this._fields.length;i++) {
                        this._fields[i]._layout();
                    }
                    $wb(this.elm().find('.wb-input:eq(0)')).focus();
                }
            });
            
            this.bind('render',function() {
                if (this._editMode) {
                    for(var i = 0; i < this._fields.length;i++) {
                        this._fields[i]._layout();
                    }
                }
            });
            
            this.elm().bind('keyup',function(evt) {
                switch(evt.keyCode) {
                    case 27: //Escape
                        if (!this.opts.editable && !this._editMode) 
                            return;
                        
                        this.cancel();
                        break;
                }
            }.bind(this));
        },
        getTable:function() {
            return this.opts.table;
        },
        getStore:function() {
            return this.opts.table.getStore();
        },
        getData:function() {
            if (this._editMode) {
                var data = this.__super();
                this.opts.data = $.extend(this.opts.data,data);
            }
            return this.opts.data;
        },
        setData:function(data) {
            if (this._editMode) {
                this.__super(data);
            }
            this.opts.data = data;
            return this;
        },
        toggleEditable:function() {
            if (!this.opts.editable) return this;
            this._editMode = !this._editMode;
            this.render();
            this.getTable()._layout();
            return this;
        },
        makeEditable:function() {
            if (!this.opts.editable || this._editMode) return this;
            this._editMode = true;
            this.render();
            this.getTable()._layout();
            return this;
        },
        makeStatic:function() {
            if (!this.opts.editable || !this._editMode) return this;
            this._editMode = false;
            this.render();
            this.getTable()._layout();
            return this;
        },
        isNew:function() {
            return this._isNew;
        },
        setIsNew:function(isNew) {
            this._isNew = isNew;
            return this;
        },
        cancel:function() {
            if (this.isNew()) {
                this.destroy();
            } else {
                this.makeStatic();
            }
        },
        _editRow:function() {
            while(this._fields.length > 0) {
                this._fields.pop().detach();
            }
            
            var row = this.target();
            row.addClass('wb-editing');
            row.html('');
            var cols = this.getStore().getColumns();
            var bodyCellTmpl = this.getTable().option('bodyCellTmpl');
            
            var actionAddons = {
                'cancel':new $wb.Action(_('Cancel'),function() {
                        this.cancel()
                    },'ban-circle',this
                )
            };
            
            if (this.getTable().option('actionPosition') == 'left') {
                this._paintActions(row,'rowEditActions',actionAddons);
            }
            
            var data = this.getData();
            for(var colId in cols) {
                var col = cols[colId];
                if (col.hidden) continue;
                var value = $wb.utils.GetValue(data,col.id);
                var fieldType = $wb.ui.FieldType.type(col.valueType);
                var cell = $(bodyCellTmpl());
                var field = fieldType.getTableField(col,value);
                field.render(cell);
                row.append(cell);
                this._fields.push(field);
            }
            
            if (this.getTable().option('actionPosition') == 'right') {
                this._paintActions(row,'rowEditActions',actionAddons);
            }
            
            
            return row;
        },
        remove:function() {
          var data = this.getData();
          var store = this.getStore();
          this.__super();
          store.remove(data);
        },
        destroy:function() {
          var data = this.getData();
          var store = this.getStore();
          this.__super();
          store.remove(data);
        },
        _viewRow:function() {
            
            while(this._fields.length > 0) {
                this._fields.pop().detach();
            }
            
            var row = this.target();
            row.removeClass('wb-editing');
            row.html('');
            
            if (this.getTable().option('actionPosition') == 'left')
                this._paintActions(row,'rowActions');
            
            var bodyCellTmpl = this.getTable().option('bodyCellTmpl');
            var cols = this.getStore().getColumns();
            for(var colId in cols) {
                var col = cols[colId];
                if (col.hidden) continue;
                var cell = $(bodyCellTmpl());
                var value = $wb.utils.GetValue(this.getData(),col.id);
                
                var fieldType = $wb.ui.FieldType.type(col.valueType);
                
                cell.html(fieldType.format(col,value));
                row.append(cell);
            }
            
            if (this.getTable().option('actionPosition') == 'right')
                this._paintActions(row,'rowActions');
            
            return row;
        },
        _paintActions:function(row,rowActionsOption,addons) {
            var self = this;
            var rowActions = this.getTable().option(rowActionsOption);
            
            if ($.type(rowActions) == 'function')
                rowActions = rowActions.apply(this,[row]);
            
            if ($.type(addons) == 'function')
                addons = addons.apply(this,[row]);
            
            rowActions = $.extend({},addons,rowActions);
            if (this.getTable().hasActions() || addons) {
                var actionCellTmpl = this.getTable().option('actionCellTmpl');
                var actionCell = $(actionCellTmpl());
                actionCell.addClass('wb-disabled');
                
                if (rowActions) {
                    
                    actionCell.removeClass('wb-disabled');
                    actionCell.click(function(evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        var menu = new $wb.ui.DropdownMenu();
                        for(var name in rowActions) {
                            var action;
                            if (typeof rowActions[name] == 'function') {
                                action = new $wb.Action(null,rowActions[name],name,self);
                            } else {
                                action = rowActions[name].clone().context(self);
                            }
                            menu.add(action);
                        }
                        menu.render(actionCell);
                    });
                } else {
                    actionCell.noclick();
                }
                
                row.append(actionCell);
            }
        }
    }
);

$wb.ui.Table = $wb.Class('Table',
    /**
     * @lends $wb.ui.Table.prototype
     * @augments $wb.ui.Widget
     */
    {
        __extends:[$wb.ui.Widget,$wb.ui.helper.Scrollable],
        __defaults:{
            target:'.wb-inner-table',
            scrollContainer:'.wb-table-body-scroll',
            tmpl:$wb.template.table.base,
            headerTmpl:$wb.template.table.header,
            footerTmpl:$wb.template.table.footer,
            bodyTmpl:$wb.template.table.body,
            rowTmpl:$wb.template.table.row,
            bodyCellTmpl:$wb.template.table.body_cell,
            actionCellTmpl:$wb.template.table.body_action_cell,
            headerCellTmpl:$wb.template.table.header_cell,
            headerActionCellTmpl:$wb.template.table.header_action_cell,
            rowReader:function(row) {
                return row;
            },
            editable:false,
            scrollable:true,
            paging:{
                currentPage:0
            },
            filters:[],
            header:true,
            footer:true,
            headerActions:null,
            rowActions:null,
            layoutMode:'fit', // can be fit or auto
            actionPosition:'right', // Can be left or right
            actionFixed:false,//Only valid if layoutMode is auto
            layout:function() {
                
                
                if (this.opts.layoutMode == 'auto') {
                    var width = this.elm().innerWidth();
                    this.elm().findFirst('.wb-table-body-scroll').outerWidth(width);
                    if (this.opts.actionFixed)
                        this.elm().addClass('wb-action-fixed-'+this.opts.actionPosition);
                    if (this.opts.actionFixed && this._hasActionColumn()) {
                        this.elm().addClass('wb-action-fixed-'+this.opts.actionPosition);
                        var actionWidth = 0;
                        var actionCell;
                        if (this.opts.header) {
                            actionCell = this._header.findFirst('.wb-actions');
                            actionWidth = actionCell.outerWidth();
                        } else {
                            actionCell = this._body.findFirst('.wb-actions');
                            actionWidth = actionCell.outerWidth();
                        }
                        
                        if (actionWidth > 0) {
                            this.elm().find('.wb-table-row').each(function() {
                                var firstCell = $(this).find('.wb-table-cell').not('.wb-actions')[0];
                                if (firstCell) {
                                    $(firstCell).css('padding-left','inherit');
                                    var oldPadding = parseInt($(firstCell).css('padding-left'));
                                    if (isNaN(oldPadding))
                                        oldPadding = 0;
                                    $(firstCell).css('padding-left',actionWidth+oldPadding);
                                }
                            });
                        }
                    }
                    
                    
                    
                    
                } else {

                    var availWidth = parseInt(this.elm()[0].style.width);
                    if (availWidth < 1) return;
                    var isHeader = false;

                    var scrollbarSize = this.getScrollbarSize();
                    if (scrollbarSize && this.isScrollingV()) {
                        availWidth -= scrollbarSize.v;
                    }
                    
                    this.elm().findFirst('.wb-table-body-scroll > table').outerWidth(availWidth);

                    var cells = null;
                    if (this.opts.header) {
                        isHeader = true;
                        cells = this._header.find('.wb-table-cell').not('.wb-actions');
                        
                    } else {
                        cells = this._body.find('.wb-table-row:eq(0) .wb-table-cell').not('.wb-actions');
                    }

                    if (this._hasActionColumn()) {
                        actionWidth = this.elm().find('.wb-actions:eq(0)').outerWidth();
                        availWidth -= actionWidth;
                    }


                    var cellWidth = Math.floor(availWidth/cells.length);

                    var firstWidth = availWidth % (cellWidth*cells.length)

                    if (isHeader) {
                        cells.outerWidth(cellWidth);
                        if (firstWidth > 0)
                            $(cells[0]).outerWidth(firstWidth+cellWidth);
                    }

                    var innerCells = this.elm().find('.wb-inner-table .wb-table-row:eq(0) .wb-table-cell').not('.wb-actions');
                    if (innerCells.length > 0) {
                        innerCells.outerWidth(cellWidth);
                        if (firstWidth > 0)
                            $(innerCells[0]).outerWidth(firstWidth+cellWidth);
                    }
                }
                //Only calculate fixed height if this table has a fixed height
                //Todo: Add support for min and max height
                var cssHeight = parseInt(this.elm()[0].style.height, 10);
                if (cssHeight > 0 && !isNaN(cssHeight)) {
                    var maxHeight = parseInt(this.elm()[0].style.height,10);
                    
                    if (this.opts.header && this.opts.layoutMode == 'fit') {
                        maxHeight -= this._header.outerHeight();
                    }
                    if (this.opts.footer) {
                        maxHeight -= this._footer.outerHeight();
                    }

                    if (maxHeight > 10) {
                        var scroller = this.elm().find('.wb-table-body-scroll');
                        scroller.outerHeight(maxHeight);
                    }
                }
            }
        },
        _header:null,
        _footer:null,
        _body:null,
        _sortColumns:{},
        _filterColumns:{},
        _filterRow:null,
        _paging:null,
        _rows:[],
        _autoUpdate:true,
        _dirty:false,
        /**
         * @constructs
         * @param {Object} opts Options
         * @param {Boolean} [opts.header=true] Show header
         * @param {Boolean} [opts.footer=true] Show footer
         * @param {Function} [opts.headerTmpl] Header template function
         * @param {Function} [opts.footerTmpl] Footer template function
         * @param {Function} [opts.bodyTmpl] Table body template function
         * @param {Function} [opts.rowTmpl] Default row renderer
         * @param {Function} [opts.bodyCellTmpl] Default cell renderer
         * @param {Function} [opts.headerCellTmpl] Default header cell renderer
         * @param {Map<Type,Function>} [opts.rowActions] Map of row btn titles along with a callback function
         * @param {Map<Type,Function>} [opts.headerActions] Map of header btn titles along with a callback function
         */
        __construct:function(opts) {
            this.__super(this.getDefaults(opts));

            this.require(this.opts,'store');
            if (!$wb.utils.isA(this.opts.store,$wb.data.TableStore))
                throw "Table widget requires TableStore or descendant";
            var self = this;
            if (this.opts.editable) {
                if (!this.opts.headerActions) {
                    
                    this.opts.headerActions = {
                        add:new $wb.Action(_('Add'),function() {
                            self.newRow();
                        },'plus')
                    };
                }
                
                if (!this.opts.rowActions) {
                    this.opts.rowActions = {
                        edit:new $wb.Action(_('Edit'),function() {
                            this.makeEditable();
                        },'edit'),
                        remove:new $wb.Action(_('Remove'),function() {
                            self.trigger('remove',[this.getData()]);
                        },'remove')
                    };
                }
                
                if (!this.opts.rowEditActions) {
                    this.opts.rowEditActions = {
                        save:new $wb.Action(_('Save'),function() {
                            if (this.isNew()) {
                                self.trigger('create',[this.getData()]);
                                this.destroy();
                            } else {
                                self.trigger('update',[this.getData()]);
                                this.makeStatic();
                            }
                        },'save')
                    };
                }
            }

            this._header = $(this.opts.headerTmpl());
            this._footer = $(this.opts.footerTmpl());
            this._body = $(this.opts.bodyTmpl());
            
            this.bind('paint',function() {
                var elm = this.elm();
                if (this.opts.layoutMode == 'auto') {
                    elm.append(this._body)
                        .append(this._footer);
                    var container = this.elm().findFirst('.wb-inner-table-container table');
                    container.css('table-layout','auto');
                    container.prepend(this._header);
                } else {
                    elm.append(this._header)
                    .append(this._footer)
                    .append(this._body);
                }
                
                if (this.opts.header)
                    this._paintHeader();
                if (this.opts.footer)
                    this._paintFooter();
                
                this._paintRows();
                
                var totalCellCount = this._getColumnCount();
                this.elm().find('.wb-inner-table-container').attr('colspan',totalCellCount+1);
            });
            
            this.bind('scrolling',function() {
                if (this.opts.layoutMode != 'auto') 
                    return;
                
                var tbl = this.elm().findFirst('.wb-table-body-scroll > table');
                var scrollbarSize = this.getScrollbarSize();
                if (scrollbarSize && this.isScrollingV()) {
                    tbl.css({
                        'padding-right':scrollbarSize.v,
                        'padding-bottom':scrollbarSize.h
                    });
                } else {
                    tbl.css({
                        'padding-right':0,
                        'padding-bottom':0
                    });
                } 
            });
            
            var onChange = function() {
                this._checkForEditing();
                
                if (this._autoUpdate) {
                    this.repaintRows();
                } else {
                    this._dirty = true;
                    this.trigger('dirty');
                }
            }.bind(this);
            
            this.opts.store.bind('change',onChange);
        },
        _hasActionColumn:function() {
            return this.elm().find('.wb-actions').length > 0;
        },
        getStore:function() {
            return this.opts.store;
        },
        _checkForEditing:function() {
            if (this.elm().find('.wb-editing').length > 0) {
                this.setAutoUpdate(false);
            } else {
                this.setAutoUpdate(true);
            }
        },
        getRow:function(key) {
            var i = this.getStore().getIndexByKey(key);
            if (i > -1)
                return this._rows[i];
            return null;
        },
        setAutoUpdate:function(autoUpdate) {
            if (this._autoUpdate == autoUpdate) 
                return;
            this._autoUpdate = autoUpdate;
            if (autoUpdate && this._dirty) {
                this.repaintRows();
            }
        },
        repaintRows:function() {
            this._paintRows();
            if (this.getPaging() != null) {
                //Update paging - if needed
                this.getPaging().setTotalPages(this.getStore().getTotalPages());
            }
            this._layout();
        },
        _getColumnCount:function() {
            var out = 0;
            var cols = this.opts.store.getColumns();
            for(var colId in cols) {
                var col = cols[colId];
                if (col.hidden) 
                    continue;
                out++;
            }
            
            if (this.hasActions())
                out++;
            
            return out;
        },
        _paintFooter:function() {
            this._footer.clear();
            var row = $(this.opts.rowTmpl());
            this._footer.append(row);
            if (!this._paging && this.opts.paging) {
                this._paging = new $wb.ui.Paging($.extend(this.opts.paging,{
                    totalPages:this.getStore().getTotalPages()
                }));
                this._paging.bind('change',function(page) {
                    var rowsPerPage = this.getStore().getRowsPerPage();
                    this.trigger('page-change',[page,page*rowsPerPage,rowsPerPage]);
                    if (!this.getStore().getSource() && this.getPaging()) {
                        this.repaintRows();
                    }
                }.bind(this));
            }
            
            var col = $('<td class="wb-paging-container"/>');
            col.append(this._paging.render());
            row.append(col);
            col.attr('colspan',this._getColumnCount()+1);
        },
        getPaging:function() {
            return this._paging;
        },
        toggleSort:function(field,ascending) {
            var cell = this._sortColumns[field];
            if (!cell) return this;
            if (typeof ascending == 'undefined') {
                cell.click();
            } else {
                var isAscending = cell.hasClass('wb-asc');
                if (isAscending != ascending)
                    cell.click();
            }
            return this;
        },
        toggleFilter:function(field,activate) {
            var cell = this._filterColumns[field];
            if (!cell) return this;
            
            if (typeof activate == 'undefined') {
                cell.find('.wb-filter').click();
            } else {
                var isActive = cell.hasClass('wb-active');
                if (isActive != activate) {
                    cell.find('.wb-filter').click();
                }
            }
            return this;
        },
        toggleFilterRow:function(show) {
            if (!this._filterRow) 
                return this;
            var isVisible = this._filterRow.elm().is(':visible');
            
            if (typeof show == 'undefined') {
                if (isVisible) {
                    this._filterRow.elm().hide();
                } else {    
                    this._filterRow.elm().show();
                }
                    
            } else {
                if (isVisible != show) {
                    return this.toggleFilterRow();
                }
            }
            this._layout();
            return this;
        },
        setPage:function(page) {
            if (!this._paging) return this;
            this._paging.setPage(page);
            return this;
        },
        _paintHeader:function() {
            this._header.clear();
            var row = $(this.opts.rowTmpl());
            this._header.append(row);
            var self = this;
            var cols = this.opts.store.getColumns();
            
            //Filter row contains any filter options that may exist
            if (!this._filterRow) {
                this._filterRow = new $wb.ui.TableRow({table:this});
                //Hack - to make it think its editing
                this._filterRow._editMode = true;
                this._filterRow.elm()
                    .addClass('wb-filter-row')
                    .bind('keypress',function(evt) {
                        if (evt.keyCode == 13) { //On enter
                            this.trigger('filter-apply',[this._filterRow.getData()]);
                        }
                            
                    }.bind(this));
            }
            this._filterRow.elm().clear();
            this._header.append(this._filterRow.elm());
            
            if (this.opts.actionPosition == 'left')
                this._paintHeaderActions(row);
            
            for(var colId in cols) {
                var col = cols[colId];
                if (col.hidden) continue;
                
                var cell = $(this.opts.headerCellTmpl());
                if (col.sortable) {
                    this._sortColumns[col.id] = cell;
                    cell.addClass('wb-sortable');
                    cell.find('.wb-title,.wb-sort').bind('click',function(evt) {
                        evt.preventDefault();
                        var elm = this.elm;
                        row.find('.wb-desc,.wb-asc')
                            .not(elm)
                            .removeClass('wb-desc')
                            .removeClass('wb-asc');

                        if (elm.hasClass('wb-desc')) {
                            if (self.trigger('sort',['ASC',this.col])) {
                                elm.addClass('wb-asc').removeClass('wb-desc');
                            }
                        } else {
                            if (self.trigger('sort',['DESC',this.col])) {
                                elm.addClass('wb-desc').removeClass('wb-asc');
                            }
                        }
                    }.bind({col:col,elm:cell}));
                }
                
                if (this.opts.filters.indexOf(col.id) > -1) {
                    this._filterColumns[col.id] = cell;
                    
                    //Make filter field
                    var fieldType = $wb.ui.FieldType.type(col.valueType);
                    var filterCell = $('<td/>');
                    var filterField = fieldType.getTableField(col,'');
                    filterField.disable();
                    filterCell.append(filterField.elm());
                    this._filterRow.elm().append(filterCell);
                    
                    cell.addClass('wb-filtered');
                    cell.find('.wb-filter').click(function(evt) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        if (this.elm.hasClass('wb-active')) {
                            if (!self._filterRow.elm().is(':visible')) {
                                self.toggleFilterRow(true);
                                return;
                            }
                            if (self.trigger('filter-disable',[this.col])) {
                                this.elm.removeClass('wb-active');
                                this.field.disable();
                                if (row.find('.wb-filtered.wb-active').length == 0) {
                                    self.toggleFilterRow(false);
                                }
                                    
                            }
                            
                        } else {
                            if (self.trigger('filter-enable',[this.col])) {
                                this.elm.addClass('wb-active');
                                this.field.enable();
                                self.toggleFilterRow(true);
                            }
                        }
                        
                    }.bind({col:col,elm:cell,field:filterField}));
                    
                } else {
                    //Add empty cell
                    this._filterRow.elm().append('<td class="wb-empty" />');
                }
                
                    
                
                cell.attr('rel',col.id);
                cell.find('.wb-title').html(col.name);
                row.append(cell);
            }
            
            if (this.opts.actionPosition == 'right')
                this._paintHeaderActions(row);
            
        },
        _paintHeaderActions:function(row) {
            var self = this;
            if (this.hasActions()) {
                var actionCell = $(this.opts.headerActionCellTmpl());
                actionCell.addClass('wb-actions wb-disabled');
                if (this.opts.headerActions) {
                    
                    actionCell.removeClass('wb-disabled');
                    actionCell.click(function(evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        var menu = new $wb.ui.DropdownMenu();
                        for(var name in self.opts.headerActions) {
                            var action;

                            if (typeof self.opts.headerActions[name] == 'function') {
                                action = new $wb.Action(null,self.opts.headerActions[name],name,this);
                            } else {
                                action = self.opts.headerActions[name].clone().context(self);
                            }
                            menu.add(action);
                        }
                        menu.render(actionCell);
                    });
                } else {
                    actionCell.noclick();
                }
                
                row.append(actionCell);
                
                if (this.opts.filters.length > 0) {
                    
                    var filterActionCell = $('<td class="wb-actions" />');
                    
                    var applyBtn = new $wb.Action(_('Apply'),function() {
                            this.trigger('filter-apply',[this._filterRow.getData()]);
                        },'apply',this
                    );
                        
                    
                    filterActionCell.append(applyBtn.render());
                    
                    var hideBtn = new $wb.Action(_('Hide'),function() {
                            this.toggleFilterRow(false);
                        },'hide',this
                    );
                    
                    filterActionCell.append(hideBtn.render());
                    
                    var clearBtn = new $wb.Action(_('Clear'),function() {
                            var elms = this._filterRow.elm().find('.wb-input');
                            for(var i = 0; i < elms.length;i++) {
                                var elm = elms[i];
                                $(elm).widget().value('');
                                this.toggleFilter($(elm).attr('name'),false);
                            }
                            this.trigger('filter-apply',[{}]);
                        },'clear',this
                    );
                    
                    filterActionCell.append(clearBtn.render());
                    this._filterRow.elm().append(filterActionCell);
                }
            }
        },
        hasActions:function() {
            return (this.opts.headerActions 
                    || this.opts.rowActions
                    || this.opts.filters.length > 0);
        },
        _paintRows:function() {
            this.elm().putAway();
            this.elm().find('.wb-inner-table').clear();
            //this.target().clear();
            var rows = this.opts.store.getRows().toArray();
            if (this._paging) {
                var offset = 0;
                var rowsPrPage = this.opts.store.getRowsPerPage();
                if (rows.length > rowsPrPage && !this.opts.store.getSource()) {
                    //Local store
                    var page = this._paging.getPage();
                    offset = rowsPrPage*page;
                    rows = rows.slice(offset,offset+rowsPrPage);
                    
                }
            }
            
            
            var odd = true;
            this._rows = [];
            for(var i = 0; i < rows.length;i++) {
                var row = this.addRow(rows[i]);
                this._rows.push(row);
                row.render();
                if (odd)
                    row.elm().addClass('wb-odd');
                odd = !odd;
            }
            this._dirty = false; 
            this.elm().putBack();
        },
        /**
         * @description Add row to table. Typically you should either add rows on the TableStore or use the newRow() 
         * method to make a new row form.
         * 
         * @returns {$wb.ui.TableRow} A row
         */
        addRow:function(data,prepend) {
            var target = this.elm().find('.wb-inner-table');
            if (!data)
                data = {};
            var row = new $wb.ui.TableRow({
                table:this,
                data:data?this.opts.rowReader(data):null,
                editable:this.opts.editable}
            );
            if (prepend)
                target.prepend(row.elm());
            else
                target.append(row.elm());
            return row;
        },
        /**
         * @description Add new row form to table. Destroy this form when you're done (and add the resulting data to
         * the store)
         * @returns {$wb.ui.TableRow} An editable row
         */
        newRow:function() {
            var row = this.addRow(null,true).setIsNew(true).makeEditable(true);
            this._layout();
            return row;
        }

    }
);
    


$wb.ui.DomPane = $wb.Class('DomPane',{
    __extends:[$wb.ui.Pane],
    __defaults:{
        tmpl:function() {
            return '<div class="wb-pane wb-dom" />'
        },
        dom:null
    },
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));

        this.bind('render',function() {
            if (!this.opts.dom) 
                return;
            this._paintDom();
        });
        
        this.elm().bind('click',function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            
            var elm = $(evt.target);
            
            if (!elm.hasClass('wb-dom-tag-start')) {
                return;
            }
            
            var folded = elm.nextAll('.wb-dom-folded');
            var content = elm.nextAll('.wb-dom-content');
            
            if (content.is(':visible')) {
                content.hide();
                folded.css('display','inline');
            } else {
                content.show();
                folded.css('display','none');
            }
        })
        
    },
    _paintDom:function() {
        var dom = this.opts.dom;
        if (!dom) return;
        
        this.target().children().remove();
        
        var html = '<ul>';
        
        html += this._paintNode(dom[0]);
        
        html += '</ul>';
        
        this.target().html(html);
    },
    _paintNode:function(node) {
        var i;
        var out = '<li';
        var jQueryNode = $(node);
        if (jQueryNode.hasClass('-wb-dom-highlight')) {
            jQueryNode.removeClass('-wb-dom-highlight');
            out += " class=\"wb-active\" ";
        }
        
        var tag = node.tagName.toLowerCase();;
        
        out += '><a class="wb-dom-tag-start" rel="%s">&lt;'.format(tag);
        
        out += tag;
        
        out += '<span class="wb-dom-attr">';
        
        for(i = 0; i < node.attributes.length;i++) {
            var attr = node.attributes[i];
            out += " <span class=\"wb-dom-attr-name\">%s</span>=<span class=\"wb-dom-attr-value\">\"%s\"</span>"
                        .format(attr.nodeName,attr.nodeValue);
        }
        
        out += '</span>';
        
        var children = jQueryNode.children();
        var html = jQueryNode.html().trim();
        if (children.length > 0 || html.length > 0) {
            out += '&gt;</a><span class="wb-dom-folded">...</span><ul class="wb-dom-content">';
            for(i = 0; i < children.length;i++) {
                var c = children[i];
                out += this._paintNode(c);
            }
            if (children.length == 0) {
                out += '<li class="wb-dom-text">%s</li>'.format(html);
            }
            out += '</ul><span class="wb-dom-tag-end">&lt;/%s&gt;</span>'.format(tag);
        } else {
            out += ' /&gt;</a>';
        }
        
        return out + '</li>'
    },
    highlight:function(path) {
        var node = this.dom().find(path);
        node.addClass('-wb-dom-highlight');
        this._paintDom();
        this.target().scrollTo('.wb-active');
    },
    dom:function() {
        if (arguments.length > 0) {
            this.opts.dom = arguments[0];
            return this;
        }
        return this.opts.dom;
    }
});
