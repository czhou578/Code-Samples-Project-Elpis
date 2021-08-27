import React from 'react';
import { Modal } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { CollaborationContent } from '..';

const CollaborationModal = (props) => {
    const { open, setOpen, ...rest } = props;
    return (
        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
        >
            <Modal.Header>{rest.title}</Modal.Header>
            <Modal.Content>
                <CollaborationContent
                    student={rest.student}
                    open={open}
                    setOpen={setOpen}
                />
            </Modal.Content>
        </Modal>
    );
};

export default CollaborationModal;
CollaborationModal.propTypes = {
    open: PropTypes.bool,
    setOpen: PropTypes.func,
};
