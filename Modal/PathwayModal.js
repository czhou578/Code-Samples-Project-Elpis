import React from 'react';
import { Modal } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { AssignStudentPathwayContent } from '..';

const PathwayModal = (props) => {
    const { open, setOpen, ...rest } = props;
    return (
        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
        >
            <Modal.Header>{rest.title}</Modal.Header>
            <Modal.Content>
                <AssignStudentPathwayContent
                    pathway={rest.pathway}
                    open={open}
                    setOpen={setOpen}
                />
            </Modal.Content>
        </Modal>
    );
};

export default PathwayModal;
PathwayModal.propTypes = {
    open: PropTypes.bool,
    setOpen: PropTypes.func,
};
