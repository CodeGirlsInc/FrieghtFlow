const React = require('react');

const MockLink = ({ href, children, className }) => {
  return React.createElement('a', { href, className }, children);
};

module.exports = MockLink;
module.exports.default = MockLink;
