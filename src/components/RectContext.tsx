import React from 'react';
import Vars from './types/Vars';
import { Observable, observable } from '@legendapp/state';

export type PlotContextType = {
    vars: Observable<Vars>,
    varsIndex: Observable<number>,
    dataIndex: Observable<number>,
}

const RectContext = React.createContext<PlotContextType>(
    {
        vars: observable({} as Vars),
        varsIndex: observable(0),
        dataIndex: observable(0),
    }
);

export default RectContext;