import React, { Component } from 'react';
import ClosePopupCross from '../ClosePopupCross';
import styles from './congratspopup.module.css';
import PropTypes from 'prop-types';

export default function CongratulationPopup(props) {
    return (
        <div className={styles.container}>
            <div className="cross" onClick={props.setOpen}>
                <ClosePopupCross />
            </div>
            <div>
                <div className={styles.descrip}>
                    <h1>Congratulations!</h1>
                </div>
                <div>
                    <h1>You&apos;ve added a new pathway!</h1>
                </div>
                <div className={styles['img-container']}>
                    <img
                        src="https://thumbs.dreamstime.com/b/gold-badge-5392868.jpg"
                        className={styles['img-wrap']}
                    />
                </div>
            </div>
        </div>
    );
}

CongratulationPopup.propTypes = {
    setOpen: PropTypes.func,
};