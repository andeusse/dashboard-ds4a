# DashboardDs4a

Dengue is a disease with no vaccine or specific treatment, which is transmitted by the female Aedes aegypti mosquito which is present in urban areas with altitudes lower than 2200 metres, including many of Colombia’s main cities. This disease can affect people in every age range, but it can be especially dangerous for children and older adults. So far this year there have been 53.602 suspected cases of dengue, 590 severe cases of dengue in Colombia, leaving 20 dead people, and according to the WHO there are around 100-400 million infections every year. Despite this, Dengue outbreaks are only controlled through reactive strategies (i.e., fumigation in the affected areas).

For these reasons, it is important to have a warning system capable of identifying possible Dengue virus outbreaks. Being able to forecast such events allows the communities and relevant health entities to create action plans to mitigate the propagation of the disease. Health control organizations are usually in overcapacity attending patients with these kinds of symptomatologies, and during this pandemic they are allocating more resources to Covid-19 patients than to other epidemics, so accurate forecasts would help reduce the pressure on the already strained Colombian health system.

## DataStructure

Section where all the necessary structures for the frontend are handled, where the structures for the about us part and the dashboard are included. The entire structure was thought of in a nested way so that when there are changes, the user does not have to wait long in the transition.

### States and cities

Structure to fill the information in the drop down menu. They contain the code that identifies the state or the city to make the API queries.

### KPI

Information to fill the dashboard KPI's

### City table

Structure to fill the dashboard table with the top of the municipalities, can be ordered by incidence or case fatality.

### API structure

Structure of the information sent by the API in JSON format. The names of the API response must be retained.

### Users

Structure to build the About Us page of the project participants.


## Components

## Menu

Main menu of the page. Contains links to the other pages.

## Home

Page with a short introduction to the project, in addition to the video developed to describe the problems addressed.

## About Us

Page with the information of the project participants, including TAs.

## Dashboard

Page with the project information.
- Country information is included, but the user may request the information by state or city. You can take a tour of the years for which information is available (approximately since 2007).
- Graphs can be displayed, among which the prediction made by the model, the quantiles constructed with the historical ones, the Bortman graph and the MMWR are shown.
- The annual incidence can be visualized in a heat map.

## Error

Page displayed in case the user makes a query to a page that does not exist.

## Services

## States JSON service

Service that reads a .JSON file with information on states and cities, used to initialize some of the dashboard components.

## Api backend service

Service for communication with the backend and the information requested by the application.

## Angular CLI

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
