import React from 'react';
import PropTypes from 'prop-types';
import { Container, Header, Grid } from 'semantic-ui-react';
import VideoStreamingExample from '../../Atoms/VideoStreamingExample/VideoStreamingExample';

export default function VideoUI(props) {
    const { content } = props;

    return (
        <div>
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                        <Container textAlign="center">
                            <Header as="h2">
                                {content.content && content.content.name != null
                                    ? content.content.name
                                    : 'No Title Assigned For Video'}
                            </Header>
                        </Container>
                        <Container textAlign="center">
                            <Header as="h2">
                                {content.content &&
                                content.content.description != null
                                    ? content.content.description
                                    : 'No Description Assigned For Video'}
                            </Header>
                        </Container>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={1} centered={true}>
                    <Grid.Column width={10}>
                        <Container>
                            <VideoStreamingExample />
                        </Container>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    );
}

VideoUI.propTypes = {
    assignment: PropTypes.object,
    content: PropTypes.array,
};