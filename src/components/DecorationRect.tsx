/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { Observable } from '@legendapp/state';
import BarContext from './BarContext';
import PlotContext from './PlotContext';
import { useContext, useRef } from 'react';
import { useObservable, useSelector} from "@legendapp/state/react"
import Rect from './Rect';
import Vars from './types/Vars';

const Div = styled.div``;

const DecorationRect = ({item, children} : {item: Observable<{decIndex: number, id: string | undefined, order: number | undefined, dataIndex: number | undefined, width: string, CSS: string | undefined, markup: string | undefined, component: React.ReactNode, useData: boolean | undefined, useDataMax: boolean | undefined}>, children: React.ReactNode}) => {
    const renderCount = ++useRef(0).current;
    console.log("BarDecoration render count: " + renderCount);
   
    const {index, data} = useContext(BarContext); 
    const {theme, orientation, vars, dataMax} = useContext(PlotContext);
    
    const trackedData = useSelector(() => {
        if (item.useData?.get()){
            return data.get()
        } else {
            return data.peek()
        }
    })

    const trackedDataMax = useSelector(() => {
        if (item.useDataMax?.get()){
            return dataMax.get()
        } else {
            return dataMax.peek()    // we dont want a re-render in this case (need to check if the inteded behaviour is achieved)
        }
    })

    const trackedStyle = useSelector(() => {
        const tempOrder = item.order.get();
        const tempWidth = item.width.get();

        return orientation.get()===0? (tempWidth?{order: tempOrder, flex: "0 0 " + tempWidth}:{order: tempOrder}):(tempWidth?{order: tempOrder, flex: "0 0 " + tempWidth}:{order: tempOrder})
    })

    const dataInjectedMarkup = useSelector(() => {
        let newMarkup = item.markup.get();
        if (newMarkup !== undefined){
            if (item.useData?.get()){
                const dIndex = item.dataIndex.peek();
                if(newMarkup??"".includes("{{$dataValue}}")) newMarkup = newMarkup?.replace(`{{$dataValue}}`, trackedData[dIndex && dIndex < data.length ? dIndex : 0]?.toString());
            }
            if (item.useDataMax?.get()){
                if(newMarkup??"".includes("{{$dataMaxValue}}")) newMarkup = newMarkup?.replace(`{{$dataMaxValue}}`, trackedDataMax?.toString());
            }
        }
        return newMarkup;
    });

    const rectItemProps : {             // TODO: change this to regular dictionary of several observables and pass it to the Rect component
                                className?: string;
                                dataIndex?: number;
                                vars?: Vars;
                                varIndex?: number;
                                order?: number;
                                style?: React.CSSProperties;
                                CSS?: string;
                            } = {
                                    className: "decoration rect " + (orientation.get()===0?"horizontal":"vertical"),
                                    dataIndex: item.decIndex.get(),
                                    vars: vars.get(),
                                    varIndex: index.get(),
                                    order: item.order.get(),
                                    style: trackedStyle as React.CSSProperties,
                                    CSS: item.CSS.get(),
                                }

    const observableProps = useObservable(rectItemProps);

    return (
        <Rect item={observableProps} id={item.id.get()} markup={dataInjectedMarkup}>
            {children}
        </Rect>
    );
}

export default DecorationRect;



// Notes: This needs to be redone again. All component props should be normal types and NOT observables. 
//        Inside each component, use useObservable to convert only the props that are expected to change and 
//        whose changes effect the component itself and not its children into observables.
//        Track only observables (via `use()`) or values computed from the observables (via `useSelector()`) 
//        in the component. By tracked, I mean that the component should re-render when the tracked observable 
//        or value changes. We need to avoid observables as props for as many components as possible to avoid 
//        forcing developers who embed these components into their apps into converting their props into 
//        observables.
//        There should be no prop drilling if possible (the Legend-State `<For>` component may be an exception).
//        Instead, use wrapper functions (Function components) to provide the required context to each component.
//        For example, this DecorationRect component is a wrapper for the Rect component. Rect is unopinionated.
//        Also, pass children ReactNodes as props so that the JSX that is placed inside the component tags gets
//        passed into the component. Wrapper components must also receive children ReactNodes as props and pass 
//        them to the wrapped component.