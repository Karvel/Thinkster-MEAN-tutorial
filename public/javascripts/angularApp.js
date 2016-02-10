var app = angular.module('flapperNews', ['ui.router']);

app.factory('posts', ['$http', 'auth', function($http, auth)
{
    var o = { posts: [] };

    o.getAll = function()
    {
        return $http.get('/posts').success(function(data) {
            angular.copy(data, o.posts);
        });//end $http.get
    };//end o.getAll

    o.create = function(post)
    {
        return $http.post('/posts', post,
    {
        headers: { Authorization: 'Bearer ' + auth.getToken() }
    }).success(function(data)
        {
            o.posts.push(data);
        });//end $http.post
    };//end o.create

    o.upvote = function(post)
    {
        return $http.put('/posts/' + post._id + '/upvote', null,
    {
        headers: { Authorization: 'Bearer ' + auth.getToken() }
    }).success(function(data)
        {
            post.upvotes += 1;
        });//end $http.put
    };//end o.upvote

    o.downvote = function(post)
    {
        return $http.put('/posts/' + post._id + '/upvote', null,
    {
        headers: { Authorization: 'Bearer ' + auth.getToken() }
    }).success(function(data)
        {
            post.upvotes -= 1;
        });//end $http.put
    };//end o.downvote

    o.get = function(id)
    {
        return $http.get('/posts/' + id).then(function(res)
        {
            return res.data;
        });//end $http.get
    };//end o.get

    o.addComment = function(id, comment)
    {
        return $http.post('/posts/' + id + '/comments', comment,
        {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        });//end $http.post
    };//end o.addComment

    o.upvoteComment = function(post, comment)
    {
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null,
        {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data)
        {
            comment.upvotes += 1;
        });//end $http.put
    };//end o.upvoteComment

    o.downvoteComment = function(post, comment)
    {
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null,
        {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data)
        {
            comment.upvotes -= 1;
        });//end $http.put
    };//end o.downvoteComment

    return o;
}]);//end o app.factory

app.factory('auth', ['$http', '$window', function($http, $window)
{
    var auth = {};

    auth.saveToken = function(token)
    {
        $window.localStorage['flapper-news-token'] = token;
    };//end auth.saveToken

    auth.getToken = function(token)
    {
        return $window.localStorage['flapper-news-token'];
    }; //end auth.getToken

    auth.isLoggedIn = function()
    {
        var token = auth.getToken();

        if(token)
        {
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        }//end if
        else
        {
            return false;
        }//end else
    };//end auth.isLoggedIn

    auth.currentUser = function()
    {
        if(auth.isLoggedIn())
        {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }//end if
    };//end auth.currentUser

    auth.register = function(user)
    {
        return $http.post('/register', user).success(function(data)
        {
            auth.saveToken(data.token);
        });//end $http.post
    };//end auth.register

    auth.logIn = function(user)
    {
        return $http.post('/login', user).success(function(data)
        {
            auth.saveToken(data.token);
        });//end $http.post
    };//end auth.logIn

    auth.logOut = function()
    {
        $window.localStorage.removeItem('flapper-news-token');
    };//end auth.logout

    return auth;
}]);//end auth app.factory

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
            })//end home
            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/posts.html',
                controller: 'PostsCtrl',
                resolve: {
                    post: ['$stateParams', 'posts', function($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }]//end post
                }//end resolve
            })//end posts
            .state('login', {
                url: '/login',
                templateUrl: '/login.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function($state, auth)
                {
                    if(auth.isLoggedIn())
                    {
                        $state.go('home');
                    }//end if
                }]//end login
            })//end login
            .state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function($state, auth)
                {
                    if(auth.isLoggedIn())
                    {
                        $state.go('home');
                    }//end if
                }]//end register
            });//end stateProvider
        $urlRouterProvider.otherwise('home');
}]);//end app.config

app.controller('MainCtrl', ['$scope', 'auth', 'posts',
    function($scope, auth, posts)
    {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.posts = posts.posts;
        $scope.addPost = function()
        {
            if(!$scope.title || $scope.title === '')
            {
                return;
            }//end if
            posts.create({
                title: $scope.title,
                link: $scope.link,
            });//end posts.create
            $scope.title ='';
            $scope.link ='';
        };//end scope.addPost
        $scope.incrementUpvotes = function(post)
        {
            posts.upvote(post);
        };//end scope.incrementUpvotes
        $scope.incrementDownvotes = function(post)
        {
            posts.downvote(post);
        };//end scope.incrementDownvotes
}]);//end MainCtrl controller

app.controller('PostsCtrl', ['$scope', 'auth','posts', 'post',
    function($scope, auth, posts, post)
    {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.post = post;
        $scope.addComment = function()
        {
            if($scope.body === '') { return; }
            posts.addComment(post._id, {
                body: $scope.body,
                author: 'user',
            }).success(function(comment)
            {
                $scope.post.comments.push(comment);
            });//end posts.addComment
            $scope.body = '';
        };//end scope.addComment
        $scope.incrementUpvotes = function(comment)
        {
            posts.upvoteComment(post, comment);
        };//end scope.incrementUpvotes
        $scope.incrementDownvotes = function(comment)
        {
            posts.downvoteComment(post, comment);
        };//end scope.incrementDownvotes
}]);//end PostsCtrl controller

app.controller('AuthCtrl', ['$scope', '$state', 'auth',
function($scope, $state, auth)
{
    $scope.user = {};

    $scope.register = function()
    {
        auth.register($scope.user).error(function(error)
        {
            $scope.error = error;
        }).then(function()
        {
            $state.go('home');
        });//end auth.register
    };//end $scope.register

    $scope.logIn = function()
    {
        auth.logIn($scope.user).error(function(error)
        {
            $scope.error = error;
        }).then(function()
        {
            $state.go('home');
        });//end auth.login
    };//end $scope.logIn
}]);//end AuthCtrl controller

app.controller('NavCtrl', ['$scope', 'auth',
function($scope, auth)
{
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logOut = auth.logOut;
}]);//end NavCtrl controller
