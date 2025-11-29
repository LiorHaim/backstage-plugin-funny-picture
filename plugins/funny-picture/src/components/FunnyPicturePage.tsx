import React from 'react';
import { Page, Header, Content, ContentHeader, SupportButton } from '@backstage/core-components';
import { Grid, Card, CardMedia, CardContent, Typography, Button } from '@material-ui/core';

export const FunnyPicturePage = () => {
  const [timestamp, setTimestamp] = React.useState(Date.now());

  const refreshImage = () => {
    setTimestamp(Date.now());
  };

  return (
    <Page themeId="tool">
      <Header title="Funny Picture" subtitle="A random funny picture for your day">
        <SupportButton>A plugin to show random pictures.</SupportButton>
      </Header>
      <Content>
        <ContentHeader title="Random Image">
          <SupportButton>Click the button to get a new image</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="column" alignItems="center">
          <Grid item>
            <Card>
              <CardMedia
                component="img"
                image={`https://picsum.photos/600/400?t=${timestamp}`}
                title="Funny Picture"
                style={{ height: 400, width: 600 }}
              />
              <CardContent>
                <Typography variant="body2" color="textSecondary" component="p">
                  Here is a random image from picsum.photos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={refreshImage}>
              Get Another Picture
            </Button>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

