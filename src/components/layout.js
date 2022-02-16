/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useStaticQuery, graphql } from 'gatsby';
import { MDXProvider } from '@mdx-js/react';

import { Box, Row, Text } from 'elemental-react';
import { Section } from '@elemental-zcash/style-guide';

import Header, { HEADER_HEIGHT } from './header';
import Sidebar from './sidebar';
import components from '../i18n/components';

import './layout.css';


const Layout = ({ placeItems, children, pageContext }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  const { title, type } = pageContext?.frontmatter || {};


  return (
    <>
      <MDXProvider
        components={components}
      >
        <Header siteTitle={data.site.siteMetadata.title} />
        <Row>
          <Box display={['none', null, null, 'block']}>
            <Sidebar placeItems={placeItems} />
          </Box>
          <Box
            width="100%"
            height={`calc(100vh - ${HEADER_HEIGHT}px)`}
            // p={['16px', '40px']}
            justifyContent="center"
            flexDirection="row-reverse"
          >
            <Box width="100%" flex={1}>
              <Box flex={1}>
                {type === 'Section' ? (
                  <Section title={title}>
                    <Box p={40}>
                      {children}
                    </Box>
                  </Section>
                ) : children}
              </Box>
            </Box>
          </Box>
        </Row>
        {/* <div>
          <main>{children}</main>
          <footer>
            © {new Date().getFullYear()}, Built with
            {` `}
            <a href="https://www.gatsbyjs.org">Gatsby</a>
          </footer>
        </div> */}
      </MDXProvider>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
