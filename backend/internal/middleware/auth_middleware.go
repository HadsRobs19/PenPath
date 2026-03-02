package middleware

import (
	"context"
	"fmt"
	backend "penpath-backend"
	"penpath-backend/internal/models"
	"strings"

	"os"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

var JWTVerifierInstance JWTVerifier

type JWTVerifier struct {
	issuer   string
	audience string
	keyfunc  jwt.Keyfunc
}

// NewJWTVerifier initializes the verifier once at startup to load JWKS so middleware can varify RS256 signatures later
func NewJWTVerifier(issuer string, audience string) {

	// store expected issuer and audience
	JWTVerifierInstance = JWTVerifier{
		issuer:   issuer,
		audience: audience,
	}
	backend.PrintInfo("Successfully initialized JWT Verifier")
	// load JWKS once at start up from the url env variable
	jwksURL := os.Getenv("JWKS_URL")
	if jwksURL == "" {
		_ = backend.PrintSevereErr("JWKS_URL environment variable must be populated.")
		return
	}
	// keyfunc converts JWKS into jwt.Keyfunc for the right pubic key by kid can be picked and the signature can be varified
	k, err := keyfunc.NewDefaultCtx(context.Background(), []string{jwksURL})
	if err != nil {
		_ = backend.PrintSevereErr(fmt.Sprintf("Failed to load JWKS: %v", err))
		return
	}

	JWTVerifierInstance.keyfunc = k.Keyfunc

}

// runs requests on protected routes, varifying that a token exists, a signature is valid through JWKS, claims match issuers, and attaches user context
func (jw *JWTVerifier) AuthMiddleware(c fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return fiber.ErrUnauthorized
	}
	const bearerPrefix = "Bearer "
	if !strings.HasPrefix(authHeader, bearerPrefix) {
		return fiber.ErrUnauthorized
	}
	tokenString := strings.TrimPrefix(authHeader, bearerPrefix)

	// if JWKS arent loaded, token relaibility can't be verified
	if jw.keyfunc == nil {
		return fiber.ErrInternalServerError
	}

	token, err := jwt.ParseWithClaims(
		tokenString,
		&models.SupabaseClaims{},
		// use the verifier's loaded JWKS to validate signature
		jw.keyfunc,
		jwt.WithExpirationRequired(),
		jwt.WithIssuedAt(),
		jwt.WithNotBeforeRequired(),
	)

	//TODO: harden rejecting tokens whos alg header isnt RS256 AND token headers that say "none"
	if err != nil || !token.Valid {
		return fiber.ErrUnauthorized
	}

	claims, ok := token.Claims.(*models.SupabaseClaims)
	if !ok {
		return fiber.ErrUnauthorized
	}

	// validate issuer, or supabase issuer string,
	if claims.Issuer != jw.issuer {
		return fiber.ErrUnauthorized
	}

	audOK := false
	for _, aud := range claims.Audience {
		if aud == jw.audience {
			audOK = true
			break
		}
	}
	if !audOK {
		return fiber.ErrUnauthorized
	}

	// connect identity to request context so controllers will have access to them
	c.Locals("user_id", claims.Subject) // users UUID to establish who the user is
	c.Locals("role", claims.Role)

	return c.Next()
}
