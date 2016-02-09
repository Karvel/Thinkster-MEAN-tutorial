var app = angular.module('flapperNews', ['ui.router']);

app.factory('posts', ['$http', function($http){
    var o = {
        posts: []
    };//end o

    o.getAll = function() {
        return $http.get('/posts').success(function(data) {
            angular.copy(data, o.posts);
        });//end return $http.get
    };//end o.getAll

    return o;
}]);//end app.factory

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider)
    {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: {
                    postPromise: ['posts', function(posts) {
                        return posts.getAll();
                    }]//end postPromise
                }//end resolve
            })//end home state
            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/posts.html',
                controller: 'PostsCtrl'
            });//end stateProvider
        $urlRouterProvider.otherwise('home');
}]);//end app.config

app.controller('MainCtrl', ['$scope','posts',
    function($scope, posts)
    {
        $scope.posts = posts.posts;
        $scope.addPost = function()
        {
            if(!$scope.title || $scope.title === '')
            {
                return;
            }//end if
            $scope.posts.push({
                title: $scope.title,
                link: $scope.link,
                upvotes: 0,
                comments: [
                    {author: 'Joe', body: 'Cool post!', upvotes: 0},
                    {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
                ]//end comments
            });//end scope.posts.push
            $scope.title ='';
            $scope.link ='';
        };//end scope.addPost
        $scope.incrementUpvotes = function(post)
        {
            post.upvotes += 1;
        };//end scope.incrementUpvotes
}]);//end MainCtrl controller

app.controller('PostsCtrl', ['$scope','$stateParams','posts',
    function($scope, $stateParams, posts)
    {
        $scope.post = posts.posts[$stateParams.id];
        $scope.addComment = function(){
            if($scope.body === '') { return; }
            $scope.post.comments.push({
                body: $scope.body,
                author: 'user',
                upvotes: 0
            });
            $scope.body = '';
        };//end scope.addComment
}]);//end PostsCtrl controller
