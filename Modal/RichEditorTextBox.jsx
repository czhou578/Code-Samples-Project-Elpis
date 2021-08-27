import React, { Component } from 'react';
import ReactQuill from 'react-quill';
import PropTypes from 'prop-types';
import { Field } from 'formik';
import sanitizeHtml from 'sanitize-html';
import 'react-quill/dist/quill.snow.css';
import { SignalCellularNoSimOutlined } from '@material-ui/icons';

const toolbarOptions = ['bold'];

class RichTextBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
        };
    }

    modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
        ],
    };

    formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
    ];

    sanitize = (value) => {
        this.setState({ text: sanitizeHtml(value) });
    };

    textChangedHandler = (content, delta, source, editor) => {
        if (editor.getText() === '\n') {
            this.props.formProps.setFieldValue('articleInput', '');
        } else {
            this.props.formProps.setFieldValue('articleInput', editor.getHTML());
        }
    };

    render() {
        return (
            <Field name="articleInput">
                {({ field }) => (
                    <ReactQuill
                        theme="snow"
                        modules={this.modules}
                        formats={this.formats}
                        value={field.value}
                        onChange={this.textChangedHandler}
                        onBlur={() => this.sanitize(field.value)}
                        style={{
                            height: '250px',
                            width: '100%',
                            marginBottom: '30px',
                        }}
                    />
                )}
            </Field>
        );
    }
}

RichTextBox.propTypes = {
    formProps: PropTypes.object,
};

export default RichTextBox;