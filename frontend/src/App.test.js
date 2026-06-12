import { render } from '@testing-library/react';

jest.mock('react-router-dom', () => {
  const React = require('react');
  return {
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <div>{children}</div>,
    Route: () => null,
    Navigate: () => null,
    NavLink: ({ children }) => <a href="/">{children}</a>,
    useNavigate: () => jest.fn(),
    useParams: () => ({ id: '1' }),
  };
}, { virtual: true });

test('renders application shell without crashing', () => {
  const App = require('./App').default;
  render(<App />);
  expect(document.body).toBeTruthy();
});
