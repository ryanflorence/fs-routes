[x] generate routes from files
   [x] layouts
   [x] index
   [x] children

[ ] server pre-render
   [ ] render markup
   [ ] fetch all data

[ ] client navigation
   [ ] wait for critical data
   [ ] add loading indication to old page
   [ ] transition to partial data on long loads
   [ ] add loading indication to partial page
   [ ] use location state links for partial page
   [ ] preload data from links on the page

[ ] app features
  [ ] authentication
  [ ] if authenticated, show courses in nav
  [ ] modal route



Layout scenarios:

- Application layout, wraps *everything*
- Root, not associated with any URLs
  - configuration necessary
  - component hierarchy is the "configuration"
- Continuous, URL nests, components nest
  - happy path
  - use nested folders for nested UI
- Terminal, URL nests but UI doesn't
  - use dot syntax for URL but not nested UI
