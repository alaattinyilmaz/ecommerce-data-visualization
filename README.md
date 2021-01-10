# ecommerce-data-visualization
![license](https://img.shields.io/github/license/alaattinyilmaz/ecommerce-data-visualization)

A force-directed graph visualization tool based on an online e-commerce website data by use of d3.js library.

Demo: https://alaattinyilmaz.github.io/ecommerce-tool/

Grey Nodes: People, Blue nodes: Products, Pink Node: Center User to be analyzed, Red Nodes: The people which purchased that product!

![image](https://user-images.githubusercontent.com/22120701/104111507-9a0ce900-52f3-11eb-9d72-ed03aa2ad8e1.png)

### Dataset Description
In this project, an online UK based retail web site data provided by UC Irvine Machine Learning Repository which has 541909 rows. This transnational dataset contains all user transactions on this web site since December 2010 to December 2011. All of these transactions are made across 4339 people and the number of products that is purchased is 3941. Dataset is [here](https://archive.ics.uci.edu/ml/datasets/online+retail).

### Visualization Tool
The tool includes a force-directed graph visualization that shows user-product and product-user interactions by highlighting the connections on clicking actions. Moreover, scatter visualization of a user activity clicking on a user node twice.
#### Country Filter
Users can be filtered according to their countries by use of country filter that can help to analyze which countries are more active in purchasing. This can also help to analyze products which the people are interested in specific countries. It can be used to increase stocks of these products in these
countries.
#### Time Filter
Another important feature of the developed tool is the ability of the filtering of people according to a timeline. Selecting an area of the timeline can allow in understanding which users made transactions and which products were purchased.

### More details
For more details please visit: docs/ecommerce-data-visualization-report.pdf
