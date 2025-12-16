"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Editor } from '@tiptap/core';
import { Table as TableIcon } from 'lucide-react';

interface TableMenuProps {
    editor: Editor;
    onClose: () => void;
}

export function TableMenu({ editor, onClose }: TableMenuProps) {
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);

    const insertTable = () => {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
        onClose();
    };

    const addRowBefore = () => {
        editor.chain().focus().addRowBefore().run();
    };

    const addRowAfter = () => {
        editor.chain().focus().addRowAfter().run();
    };

    const deleteRow = () => {
        editor.chain().focus().deleteRow().run();
    };

    const addColumnBefore = () => {
        editor.chain().focus().addColumnBefore().run();
    };

    const addColumnAfter = () => {
        editor.chain().focus().addColumnAfter().run();
    };

    const deleteColumn = () => {
        editor.chain().focus().deleteColumn().run();
    };

    const mergeCells = () => {
        editor.chain().focus().mergeCells().run();
    };

    const splitCell = () => {
        editor.chain().focus().splitCell().run();
    };

    const deleteTable = () => {
        editor.chain().focus().deleteTable().run();
        onClose();
    };

    const isInTable = editor.isActive('table');

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <TableIcon className="w-4 h-4" />
                    Table Options
                </h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="h-7 w-7 p-0 rounded-md hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label="Close"
                >
                    ×
                </button>
            </div>

            {!isInTable ? (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rows</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={rows}
                            onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                            className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Columns</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={cols}
                            onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                            className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={insertTable}
                        className="w-full"
                    >
                        Insert Table
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addRowBefore}
                        >
                            Add Row Before
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addRowAfter}
                        >
                            Add Row After
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={deleteRow}
                        >
                            Delete Row
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addColumnBefore}
                        >
                            Add Column Before
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addColumnAfter}
                        >
                            Add Column After
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={deleteColumn}
                        >
                            Delete Column
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={mergeCells}
                        >
                            Merge Cells
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={splitCell}
                        >
                            Split Cell
                        </Button>
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={deleteTable}
                        className="w-full"
                    >
                        Delete Table
                    </Button>
                </div>
            )}
        </div>
    );
}

