/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import styled from '@emotion/styled';
import DOMPurify from "dompurify";
import { Observable } from '@legendapp/state';
import BarContext from './BarContext';
import PlotContext from './PlotContext';
import { useContext, useRef } from 'react';
import { useSelector } from "@legendapp/state/react"
import { enableReactUse } from '@legendapp/state/config/enableReactUse';
import Vars from './types/Vars';
import RectContext from './RectContext';

enableReactUse();

const Div = styled.div``;

// split item into dictionary of observable type for properties that users might want to change, and regular type for properties that users are not expected to change.
const Rect = ({ item, id, markup, children }:{ children: React.ReactNode, item: Observable<{className?: string, dataIndex?: number, vars?: Vars, varIndex?: number, order?: number, style?: React.CSSProperties, CSS?: string}>, id?: string, markup?: string}) => {
    const renderCount = ++useRef(0).current;
    console.log("Bar render count: " + renderCount);

    const trackedIndex = item.varIndex.use();
    const dataIndex = item.dataIndex.use();
    const classes = item.className.use();
    const style = item.style.use();
    const CSS = item.CSS.use();

    const vars = item.vars;

    if (children) {
        return (
            <Div 
            id={id? id : "rect-" + trackedIndex??0 + "-" + dataIndex??0} 
            className={(classes??"rect") } 
            style={style} 
            css={css`${CSS}`} 
            // onClick={onClickHandler??undefined}
            >
                <RectContext.Provider value={{vars, varsIndex: item.varIndex, dataIndex: item.dataIndex}}>
                    {children}
                </RectContext.Provider>
            </Div>
        );
    }
    else {
        const sanitizedMarkup = useSelector(() => {
            let newMarkup = markup;
            if (newMarkup !== undefined){
                Object.keys(vars).forEach((key) => {
                    const length = vars[key].length;
                    const value = vars.get()[key][trackedIndex < length? trackedIndex : trackedIndex%length];
                    if (Array.isArray(value)){
                        newMarkup = newMarkup?.replace(`{{${key}}}`, value[dataIndex]?.toString());
                    } else {
                        newMarkup = newMarkup?.replace(`{{${key}}}`, value?.toString());
                    }
                });
            }
            const sanitizedMarkup = DOMPurify.sanitize(newMarkup??"");
            return sanitizedMarkup;
        });

        return (
            <Div 
            id={id? id : "rect-" + trackedIndex + "-" + dataIndex} 
            className={(classes? classes : "rect") } 
            dangerouslySetInnerHTML={{__html: sanitizedMarkup }} 
            style={style} 
            css={css`${CSS}`} 
            // onClick={onClickHandler??undefined}
            />
        );
    }
}

export default Rect;