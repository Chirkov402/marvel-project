import { useState, useEffect, createRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import useMarvelService from '../../services/MarvelService';
import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';

import './charList.scss';

const CharList = (props) => {
    // const nodeRef = useRef(null);

    const [charList, setCharList] = useState([]);
    const [newItemLoading, setNewItemLoading] = useState(false);
    const [offset, setOffset] = useState(210);
    const [charEnded, setCharEnded] = useState(false);
    
    const {loading, error, getAllCharacters} = useMarvelService();

    useEffect(() => {
        onRequest(offset, true);
    }, [])

    const onRequest = (offset, initial) => {
        initial ? setNewItemLoading(false) : setNewItemLoading(true);
        getAllCharacters(offset)
            .then(onCharListLoaded)
    }

    const onCharListLoaded = (newCharList) => {
        let ended = false;
        if (newCharList.length < 9) {
            ended = true;
        }

        setCharList(charList => [...charList, ...newCharList]);
        setNewItemLoading(false);
        setOffset(offset => offset + 9);
        setCharEnded(ended);
    }

    const focusOnItem = (ref) => {
        ref.current.classList.add("char__item_selected");
        ref.current.focus();
    };
    
    const blurOnItem = (ref) => {
        ref.current.classList.remove("char__item_selected");
    };

    const renderItems = arr => {
        const items = arr.map((item, i) => {
            let imgStyle;
            if (item.thumbnail.includes("image_not_available")) {
            imgStyle = { objectFit: "unset" };
        }

            const itemRef = createRef(null);
            
            return (
            <CSSTransition
                key={item.id}
                in={true}
                timeout={500}
                classNames="char__item"
                nodeRef={itemRef}
            >
                <li
                    className="char__item"
                    key={item.id}
                    tabIndex={0}
                    ref={itemRef}
                    onClick={() => {
                        props.onCharSelected(item.id);
                        focusOnItem(itemRef);
                    }}
                    onBlur={() => blurOnItem(itemRef)}
                >
                    <img style={imgStyle} src={item.thumbnail} alt={item.name} />
                    <div className="char__name">{item.name}</div>
                </li>
            </CSSTransition>
        );
        });

        return (
            <ul className="char__grid">
                <TransitionGroup component={null}>
                    {items}
                </TransitionGroup>
            </ul>
        )
    }
    
    const items = renderItems(charList);

    const errorMessage = error ? <ErrorMessage/> : null;
    const spinner = loading && !newItemLoading ? <Spinner/> : null;

    return (
        <div className="char__list">
            {errorMessage}
            {spinner}
            {items}
            <button 
                disabled={newItemLoading}
                style={{display: charEnded ? 'none' : 'block'}}
                className="button button__main button__long"
                onClick={() => onRequest(offset)}>
                <div className="inner">load more</div>
            </button>
        </div>
    )
}

export default CharList;