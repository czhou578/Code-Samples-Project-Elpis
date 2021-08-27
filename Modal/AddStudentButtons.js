import { Button, Container } from 'semantic-ui-react';
import React from 'react';
import PropTypes from 'prop-types';

export const AddStudentButtons = (props) => {
    const { setOpen, isValid, isSubmitting, dirty } = props;

    return (
        <Container fluid textAlign="right" style={{ paddingRight: '1rem' }}>
            <Button
                type="submit"
                disabled={!isValid || isSubmitting || !dirty}
                content="Add Student"
                labelPosition={dirty && isValid ? 'right' : null}
                icon={dirty && isValid ? 'checkmark' : null}
                positive
            />
            <Button color="black" onClick={() => setOpen(false)}>
                Close
            </Button>
        </Container>
    );
};

AddStudentButtons.propTypes = {
    setOpen: PropTypes.func,
    isValid: PropTypes.bool,
    isSubmitting: PropTypes.bool,
    dirty: PropTypes.bool,
};
