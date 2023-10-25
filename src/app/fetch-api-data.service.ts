import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

interface UserDetail {
  Username: string;
  Password: string;
}

type UserRegistrationResponse = UserDetail;

interface UpdatedUser {
  Username: string;
  Password: string;
  Email: string;
  Birthday: string;
}

interface LoginResponse {
  user: string;
  token: string;
}

interface Movie {
  Title: string;
  Description: string;
  Genre: {
    Name: string;
    Description: string;
  };
  Director: Director;
  Actors: Array<string>;
  ImagePath: string;
  Featured: boolean;
}

interface Director {
  Name: string;
  Bio: string;
}

interface LoggedInUser {
  token: string;
  user: {
    _id: string;
  };
}

//Declaring the api url that will provide data for the client app
const apiUrl = 'https://aidens-myflix-api.herokuapp.com/api/';
@Injectable({
  providedIn: 'root',
})
export class FetchApiDataService {
  // Inject the HttpClient module to the constructor params
  // This will provide HttpClient to the entire class, making it available via this.http
  constructor(private http: HttpClient) {}

  /**
   * direct users to the login page.
   * @param userDetails
   * @returns will log in the user with a token and user info in local storage
   * used in user-login-form component
   */

  public userLogin(userDetails: UserDetail): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(apiUrl + 'login', userDetails)
      .pipe(catchError(this.handleError)) as Observable<LoginResponse>;
  }

  /**
   * Making the api call for the user registration endpoint
   * @param userDetails
   * @returns a user that has been registered in the DB
   * used in user-registration-form component
   */

  public userRegistration(
    userDetails: UserDetail,
  ): Observable<UserRegistrationResponse> {
    return this.http
      .post<UserRegistrationResponse>(apiUrl + 'users', userDetails)
      .pipe(
        catchError(this.handleError),
      ) as Observable<UserRegistrationResponse>;
  }

  /**
   * @returns all of the movies
   * used in the movie-card component
   */

  getAllMovies(): Observable<Array<Movie>> {
    const token = localStorage.getItem('token');
    return this.http
      .get<Array<Movie>>(apiUrl + 'movies', {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(
        map(this.extractResponseData),
        catchError(this.handleError),
      ) as Observable<Array<Movie>>;
  }

  /**
   * @param Title
   * @returns a movie title for the user
   */

  getOneMovie(title: string): Observable<Movie> {
    const token = localStorage.getItem('token');
    return this.http
      .get<Movie>(apiUrl + 'movies/title/' + title, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(
        map(this.extractResponseData),
        catchError(this.handleError),
      ) as Observable<Movie>;
  }

  /**
   * @param Name
   * @returns the name of the Director
   * used in the movie-card component
   */

  getOneDirector(directorName: string): Observable<Director> {
    const token = localStorage.getItem('token');
    return this.http
      .get<Director>(apiUrl + 'movies/director_description/' + directorName, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(
        map(this.extractResponseData),
        catchError(this.handleError),
      ) as Observable<Director>;
  }

  /**
   * @param Name
   * @returns the name of the genre
   * used in the movie-card component
   */

  getGenre(genreName: string): Observable<string> {
    const token = localStorage.getItem('token');
    return this.http
      .get<string>(apiUrl + 'movies/genre_description/' + genreName, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(
        map(this.extractResponseData),
        catchError(this.handleError),
      ) as Observable<string>;
  }

  /**
   * gets one of the users
   * @returns returns the user on the localstorage
   */

  getOneUser(): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    return this.http
      .get(apiUrl + 'users/' + user.Username, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * have the list of favorite movies displayed on their profile page
   * @returns the users array of favorite movies
   */

  getFavoriteMovies(): Observable<LoggedInUser> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    return this.http
      .get<LoggedInUser>(apiUrl + 'users/' + user.Username, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(
        map(this.extractResponseData),
        map((data) => data.FavoriteMovies),
        catchError(this.handleError),
      ) as Observable<LoggedInUser>;
  }

  /**
   *
   * @param movieID
   * @returns a movie added to the users favorite movies array
   * used in movie-card component
   */

  addFavoriteMovie(movieId: string): Observable<UpdatedUser> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    user.FavoriteMovies.push(movieId);
    localStorage.setItem('user', JSON.stringify(user));
    return this.http
      .post(
        apiUrl + 'users/' + user.Username + '/movies/' + movieId,
        {},
        {
          headers: new HttpHeaders({
            Authorization: 'Bearer ' + token,
          }),
          responseType: 'text',
        },
      )
      .pipe(
        map(this.extractResponseData),
        catchError(this.handleError),
      ) as Observable<UpdatedUser>;
  }

  /**
   * @param movieID
   * @returns a boolean value that will check if the favorite movies array has any movieID
   * used in the movie-card component
   */

  isFavoriteMovie(movieID: string): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.FavoriteMovies.indexOf(movieID) >= 0;
  }

  /**
   * edit the users profile and update information
   * @param updatedUser
   * @returns takes the data the user wants to change in the user-profile component and
   * updates it for the user and the DB
   */

  editUser(updatedUser: UpdatedUser): Observable<UpdatedUser> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    return this.http
      .put(apiUrl + 'users/' + user.Username, updatedUser, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(
        map(this.extractResponseData),
        catchError(this.handleError),
      ) as Observable<UpdatedUser>;
  }

  /**
   * @param movieID
   * @returns deletes the movie from the users favorite movies array
   * used in the movie card component
   */

  deleteFavoriteMovie(movieId: string): Observable<UpdatedUser> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    const index = user.FavoriteMovies.indexOf(movieId);
    if (index > -1) {
      // only splice array when item is found
      user.FavoriteMovies.splice(index, 1); // 2nd parameter means remove one item only
    }
    // save updated user to local storage
    localStorage.setItem('user', JSON.stringify(user));
    return this.http
      .delete(apiUrl + 'users/' + user.Username + '/movies/' + movieId, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
        responseType: 'text',
      })
      .pipe(
        map(this.extractResponseData),
        catchError(this.handleError),
      ) as Observable<UpdatedUser>;
  }

  /**
   * delete the users account
   * @returns a deleted user from the DB
   * used in user-profile component
   */

  deleteUser(): Observable<string> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    return this.http
      .delete<string>(apiUrl + 'users/' + user.Username, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(catchError(this.handleError)) as Observable<string>;
  }

  // Non-typed response extraction
  private extractResponseData(res: any): any {
    const body = res;
    return body || {};
  }

  private handleError(error: HttpErrorResponse): any {
    if (error.error instanceof ErrorEvent) {
      console.error('Some error occurred:', error.error.message);
    } else {
      console.error(
        `Error Status code ${error.status}, ` + `Error body is: ${error.error}`,
      );
    }

    return throwError(() => 'Something bad happened; please try again later.');
  }
}
