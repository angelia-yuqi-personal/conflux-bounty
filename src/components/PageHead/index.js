import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './action';

import headImg from '../../assets/iconfont/conflux-head-logo.svg';
import homeImg from '../../assets/iconfont/conflux-home-logo.svg';
import UserBack from '../../assets/iconfont/user-back.svg';
import { i18n, compose, commonPropTypes, auth, isPath } from '../../utils';
import PhotoImg from '../PhotoImg';
import Select from '../Select';

const Wrap = styled.div`
  &.normal {
    width: 100%;
    background: #ffffff;
    box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.12);
    display: flex;
    padding: 20px;
    margin-bottom: 40px;
    height: 80px;
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 100;
  }

  &.home {
    width: 100%;
    display: flex;
    padding: 20px;
    z-index: 100;
    background: transparent;
    box-shadow: none;
    height: 80px;

    &.sticky {
      position: sticky;
    }
    .head-select {
      .input-field input {
        color: #fff;
      }
      .caret path:first-child {
        stroke: #fff;
        fill: #fff;
      }
    }
  }

  .bountylogo {
    height: 40px;
  }
  .right-info {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;
  }
  .right-info > button {
    display: flex;
    align-items: center;
  }

  .red-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    right: -4px;
    top: -4px;
    border-radius: 50%;
    z-index: 220;
    background: #f0453a;
  }
  .red-dot-hidden {
    display: none;
  }
  .bounty-user-nologin {
    width: 40px;
    height: 40px;
    font-size: 40px;
    line-height: 40px;
    margin-left: 18px;
    cursor: pointer;
  }
  .bounty-user-loigin {
    margin-left: 18px;
    position: relative;
  }
  a:hover {
    text-decoration: none;
  }
  .head-select {
    width: 88px;
    margin-left: 10px;
    .select .caret {
      top: 10px;
      right: 2px;
    }
  }
  .head-select .input-field {
    margin-top: 0;
    margin-bottom: 0;
    > input {
      cursor: pointer;
      height: 44px;
      margin: 0;
      text-indent: 10px;
    }
  }
`;

// eslint-disable-next-line react/prefer-stateless-function
class PageHead extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      homeSticky: false,
    };

    // navigator.language to google translationg compatible language code
    // eg. zh -> zh-CN, en-US -> en
    let lang = localStorage.getItem('SITE_LANG') || navigator.language;
    if (lang.startsWith('zh')) {
      lang = 'zh-CN';
    }

    if (lang.startsWith('en')) {
      lang = 'en';
    }

    // TODO: support more language
    if (lang !== 'zh-CN') {
      lang = 'en';
    }

    const { updateCommon } = this.props;
    updateCommon({
      lang,
    });
  }

  componentDidMount() {
    const { getAccount, getUnreadMessageCount, history } = this.props;
    if (auth.loggedIn()) {
      getAccount();
      getUnreadMessageCount();
    }

    const pageWrapper = document.getElementById('page-wrapper');
    this.onScroll = () => {
      const { homeSticky } = this.state;
      if (pageWrapper.scrollTop > 200) {
        if (homeSticky === false) {
          this.setState({
            homeSticky: true,
          });
        }
      } else if (homeSticky === true) {
        this.setState({
          homeSticky: false,
        });
      }
    };

    history.listen((location, action) => {
      if (action === 'PUSH') {
        pageWrapper.scrollTop = 0;
      }
    });

    history.listen(location => {
      if (isPath(location, '/')) {
        pageWrapper.addEventListener('scroll', this.onScroll);
      } else {
        pageWrapper.removeEventListener('scroll', this.onScroll);
      }
    });
    // eslint-disable-next-line react/destructuring-assignment
    if (isPath(this.props.location, '/')) {
      pageWrapper.addEventListener('scroll', this.onScroll);
    }
  }

  createBounty = () => {
    const { history } = this.props;

    if (!auth.loggedIn()) {
      history.push(`/signin`);
    } else {
      history.push('/create-bounty');
    }
  };

  render() {
    const { head, location, updateCommon, lang } = this.props;
    const { homeSticky } = this.state;
    let wrapClass;
    if (isPath(location, '/')) {
      if (homeSticky === true) {
        wrapClass = 'normal';
      } else {
        wrapClass = 'home';
      }
    } else {
      wrapClass = 'normal';
    }

    return (
      <Wrap className={wrapClass}>
        <Link to="/">
          <img src={wrapClass === 'home' ? homeImg : headImg} className="bountylogo" alt="bountylogo" />
        </Link>

        <div className="right-info">
          <button className="btn primary" type="button" onClick={this.createBounty}>
            <i className="material-icons dp48">add</i>
            <span>{i18n('CREATE BOUNTY')}</span>
          </button>

          {auth.loggedIn() ? (
            <Link to="/user-info" className="bounty-user-loigin">
              <PhotoImg imgSrc={head.user.photoUrl || UserBack} alt="userimg" />
              <i className={head.messageCount > 0 ? 'red-dot' : 'red-dot-hidden'} />
            </Link>
          ) : (
            <Link
              to="/signin"
              className="bounty-user-nologin"
              style={{
                color: wrapClass === 'home' ? '#fff' : '#171D1F',
              }}
            />
          )}

          <div className="head-select">
            <Select
              {...{
                label: '',
                onSelect: v => {
                  updateCommon({
                    lang: v.value,
                  });
                },
                options: [
                  {
                    label: 'English',
                    value: 'en',
                  },
                  {
                    label: '中文',
                    value: 'zh-CN',
                  },
                ],
                selected: {
                  value: lang,
                },
              }}
            />
          </div>
        </div>
      </Wrap>
    );
  }
}

PageHead.propTypes = {
  history: commonPropTypes.history.isRequired,
  location: commonPropTypes.location.isRequired,
  /* eslint react/forbid-prop-types: 0 */
  getAccount: PropTypes.object.isRequired,
  getUnreadMessageCount: PropTypes.object.isRequired,
  head: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired,
  updateCommon: PropTypes.func.isRequired,
};
PageHead.defaultProps = {};

function mapStateToProps(state) {
  return {
    head: {
      ...state.head,
      user: state.head.user || {},
    },
    lang: state.common.lang,
  };
}
const enhance = compose(
  withRouter,
  connect(
    mapStateToProps,
    actions
  )
);
export default enhance(PageHead);
