import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

interface UserDetail {
  username: string;
  password: string;
}

type UserRegistrationResponse = UserDetail;

interface UpdatedUser {
  Username: string;
  Password: string;
  Email: string;
  Birthday: Date;
  FavoriteMovies: Array<string>;
}

interface LoginResponse {
  token: string;
  userId: string;
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

  public userLogin(userDetails: UserDetail): Observable<LoginResponse> {
    // Ideally, you should use HttpParams instead of URLSearchParams.
    // and sending userDetails as the payload, not appended to the URL.

    return this.http
      .post<LoginResponse>(apiUrl + 'login', userDetails)
      .pipe(catchError(this.handleError)) as Observable<LoginResponse>;
  }

  // Making the api call for the user registration endpoint
  public userRegistration(
    userDetails: UserDetail,
  ): Observable<UserRegistrationResponse> {
    return this.http
      .post<UserRegistrationResponse>(apiUrl + 'users', userDetails)
      .pipe(
        catchError(this.handleError),
      ) as Observable<UserRegistrationResponse>;
  }

  // Making the api call for the get all movies endpoint
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

  // Making the api call for the get one movie endpoint
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

  // Making the api call for the get one director endpoint
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

  // Making the api call for the get genre endpoint
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

  // Making the endpoint for getting a user if there is one logged into localstorage
  getOneUser() {
    const user = JSON.parse(
      localStorage.getItem('user') || '{}',
    ) as LoggedInUser;
    return user;
  }

  // Making the api call for the get favourite movies for a user endpoint
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

  // Making the api call for the add a movie to favourite Movies endpoint
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

  // Making the api call for the edit user endpoint
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

  // Making the api call for the elete a movie from the favorite movies endpoint
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

  // Making the api call for the delete user endpoint
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
