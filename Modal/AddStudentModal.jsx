import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'semantic-ui-react';
import AddStudentContent from './AddStudentContent';

const AddStudentModal = (props) => {
    const { open, setOpen, ...rest } = props;
    return (
        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
        >
            <Modal.Header>{rest.title}</Modal.Header>
            <Modal.Content>
                <AddStudentContent
                    casemanagerID={rest.casemanagerID}
                    open={open}
                    setOpen={setOpen}
                />
            </Modal.Content>
        </Modal>
    );
};

export default AddStudentModal;
AddStudentModal.propTypes = {
    open: PropTypes.bool,
    setOpen: PropTypes.func,
};
